
class MIDI_Message {
    constructor(data) {
        /*
        data is Uint8Array[3] with
        data[0] : command/channel
        data[1] : note
        data[2] : velocity
        */
        this.cmd = data[0] >> 4;
        this.channel = data[0] & 0xf; // Use lsbits for channels (0-15)
        this.type = data[0] & 0xf0;
        this.note = data[1];
        this.velocity = data[2];
        if (this.velocity == 0) {
            this.type = MIDI_Message.NOTE_OFF;
        } else {
            this.type = MIDI_Message.NOTE_ON;
        }
        this.toString = function () {
            return 'type=' + this.type +
                ' channel=' + this.channel +
                ' note=' + this.note +
                ' velocity=' + this.velocity;
        };        
    }
}
MIDI_Message.NOTE_ON = 144;
MIDI_Message.NOTE_OFF = 128;
MIDI_Message.NOTE_ON_CMD = 9;
MIDI_Message.NOTE_OFF_CMD = 8;
MIDI_Message.MIDI_TIME_CODE_STATUS = 241;

class MIDIInput {

    constructor() {
        this.onMIDISuccess = this.onMIDISuccess.bind(this);
        // request MIDI access
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess({
                sysex: true
            }).then(this.onMIDISuccess, this.onMIDIFailure);
        } else {
            alert("No MIDI support in your browser.");
        }

        // Prepare callback holders to react to MIDI
        this.callbacks = {"midi_time_clock" : []};
        for (let channel = 0; channel < 16; channel++) {
            this.callbacks[channel] = {};
            this.callbacks[channel][MIDI_Message.NOTE_ON_CMD] = [];
            this.callbacks[channel][MIDI_Message.NOTE_OFF_CMD] = [];
        }

        // Manage the MIDI time clock state
        this.mtc = {}
        this.mtc.frame = 0;
        this.mtc.second = 0;
        this.mtc.minute = 0;
        this.mtc.hour = 0;
        this.mtc.rate = 0;
        this.mtc.timeInMilliseconds = 0;
    }

    onMIDISuccess(midiAccess_) {
        var inputs = midiAccess_.inputs.values();
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            console.log(input.value.name);
            // Be very careful - need to bind the callback's "this" to 
            // this class, otherwise JS binds "this" to the calling context
            input.value.onmidimessage = this.onMIDIMessage.bind(this);
        }
    }

    decodeTime(timepiece, databyte) {
        // Piece #	Data byte	Significance
        // 0	    0000 ffff	Frame number lsbits
        // 1	    0001 000f	Frame number msbit
        // 2	    0010 ssss	Second lsbits
        // 3	    0011 00ss	Second msbits
        // 4	    0100 mmmm	Minute lsbits
        // 5	    0101 00mm	Minute msbits
        // 6	    0110 hhhh	Hour lsbits
        // 7	    0111 0rrh	Rate and hour msbit
        let fourbits = databyte & 0xf;

        // Frame
        if (timepiece == 0) {
            this.mtc.frame = (this.mtc.frame & 0xf0) | fourbits;
        } else if (timepiece == 1) {
            this.mtc.frame = (this.mtc.frame & 0x0f) | (fourbits << 4);
        // Second
        } else if (timepiece == 2) {
            this.mtc.second = (this.mtc.second & 0xf0) | fourbits;
        } else if (timepiece == 3) {
            this.mtc.second = (this.mtc.second & 0x0f) | (fourbits << 4);
        // Minute
        } else if (timepiece == 4) {
            this.mtc.minute = (this.mtc.minute & 0xf0) | fourbits;
        } else if (timepiece == 5) {
            this.mtc.minute = (this.mtc.minute & 0x0f) | (fourbits << 4);
        // Hour
        } else if (timepiece == 6) {
            this.mtc.hour = (this.mtc.hour & 0xf0) | fourbits;
        } else if (timepiece == 7) {
            this.mtc.hour = (this.mtc.hour & 0x0f) | ((fourbits & 0x1) << 4);

            // Rate
            // rr = 00: 24 frames/s
            // rr = 01: 25 frames/s
            // rr = 10: 29.97 frames/s (SMPTE drop-frame timecode)
            // rr = 11: 30 frames/s
            let rate = (fourbits & 0b0110) >> 1;
            if (rate == 0) {
                this.mtc.rate = 24; // fps
            } else if (rate == 1) {
                this.mtc.rate = 25; // fps
            } else if (rate == 2) {
                this.mtc.rate = 29.97; // fps
            } else if (rate == 3) {
                this.mtc.rate = 30; // fps
            }

            // Convert to absolute time
            this.mtc.timeInMilliseconds = (
                ((this.mtc.hour * 60) + this.mtc.minute * 60) + 
                this.mtc.second + 
                (float(this.mtc.frame) / this.mtc.rate)
                ) * 1000;
        }
    }

    getMTCMilliseconds() {
        return this.mtc.timeInMilliseconds;
    }

    onMIDIMessage(data) {

        // https://users.cs.cf.ac.uk/Dave.Marshall/Multimedia/node158.html
        // https://www.midi.org/specifications-old/item/table-1-summary-of-midi-message

        // SYSTEM MESSAGES
        if (data.data[0] == MIDI_Message.MIDI_TIME_CODE_STATUS) {

            // Ardour will send Quarter-frame messages when transport is running
            // http://manual.ardour.org/synchronization/timecode-generators-and-slaves/
            let timepiece = data.data[1] >> 4; // First four bits denote which time piece this is
            let databyte = data.data[1] & 0xf; // Last four bits are the data pieces
            this.decodeTime(timepiece, databyte);

            if (timepiece == 7) {
                // Only react after receiving all 8 time pieces
                this.callbacks["midi_time_clock"].forEach(
                    callback => callback(this.mtc));
            }

            // CHANNEL MESSAGES
        } else {
            let msg = new MIDI_Message(data.data);
            // React to commands we have been taught to react to
            if (msg.cmd in this.callbacks[msg.channel]) {
                this.callbacks[msg.channel][msg.cmd].forEach(
                    callback => callback(msg));
            }
        }
    }

    onMIDIFailure(e) {
        // when we get a failed response, run this code
        console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
    }
}