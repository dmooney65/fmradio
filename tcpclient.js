
var net = require('net');

SET_FREQUENCY = 0x01;
SET_SAMPLERATE = 0x02;
SET_GAINMODE = 0x03;
SET_GAIN = 0x04;
SET_PPM = 0x05;
SET_OFFET_TUNING = 0x0a;

DEFAULT_SAMPLE_RATE	=	24000
DEFAULT_BUF_LENGTH	=	(1 * 16384)
MAXIMUM_OVERSAMPLE	=	16
MAXIMUM_BUF_LENGTH	=	(MAXIMUM_OVERSAMPLE * DEFAULT_BUF_LENGTH)
AUTO_GAIN	=		-100
BUFFER_DUMP	=		4096

FREQUENCIES_LIMIT	=	1000

//
//
//	commands are packed in 5 bytes, one "command byte" 
//	and an integer parameter
/*struct command {
	unsigned char cmd;
	unsigned int param;
}__attribute__((packed));

#define	ONE_BYTE	8

void	rtl_tcp_client::sendCommand (uint8_t cmd, int32_t param) {
QByteArray datagram;

	datagram. resize (5);
	datagram [0] = cmd;		// command to set rate
	datagram [4] = param & 0xFF;  //lsb last
	datagram [3] = (param >> ONE_BYTE) & 0xFF;
	datagram [2] = (param >> (2 * ONE_BYTE)) & 0xFF;
	datagram [1] = (param >> (3 * ONE_BYTE)) & 0xFF;
	toServer. write (datagram. data (), datagram. size ());
}*/

//var cmd = struct.pack(">BI", SET_GAIN, 20)

var client = new net.Socket();
client.connect(1965, '127.0.0.1', function() {
	console.log('Connected');
	//var buffer = new Buffer.alloc(5)
    //buffer.writeUInt8("0x01", 0, noAssert=false)
    //buffer.writeUInt32BE("93200000", 1, noAssert=false)
    //client.write( buffer)
	client.write('Hello, server! Love, Client.');
});


client.on('data', function(data) {
    console.log('data length',data.length)
	console.log('Received: ', data);
	//client.destroy();
	buf = Buffer.from(data.buffer)
	for (var index = 0; index < data.length; index++) {
		console.log(buf[index]);		
	}
    //client.write(cmd)
 // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
});

/*switch(cmd.cmd) {
		case 0x01:
			printf("set freq %d\n", ntohl(cmd.param));
			rtlsdr_set_center_freq(dev,ntohl(cmd.param));
			break;
		case 0x02:
			printf("set sample rate %d\n", ntohl(cmd.param));
			rtlsdr_set_sample_rate(dev, ntohl(cmd.param));
			break;
		case 0x03:
			printf("set gain mode %d\n", ntohl(cmd.param));
			rtlsdr_set_tuner_gain_mode(dev, ntohl(cmd.param));
			break;
		case 0x04:
			printf("set gain %d\n", ntohl(cmd.param));
			rtlsdr_set_tuner_gain(dev, ntohl(cmd.param));
			break;
		case 0x05:
			printf("set freq correction %d\n", ntohl(cmd.param));
			rtlsdr_set_freq_correction(dev, ntohl(cmd.param));
			break;
		case 0x06:
			tmp = ntohl(cmd.param);
			printf("set if stage %d gain %d\n", tmp >> 16, (short)(tmp & 0xffff));
			rtlsdr_set_tuner_if_gain(dev, tmp >> 16, (short)(tmp & 0xffff));
			break;
		case 0x07:
			printf("set test mode %d\n", ntohl(cmd.param));
			rtlsdr_set_testmode(dev, ntohl(cmd.param));
			break;
		case 0x08:
			printf("set agc mode %d\n", ntohl(cmd.param));
			rtlsdr_set_agc_mode(dev, ntohl(cmd.param));
			break;
		case 0x09:
			printf("set direct sampling %d\n", ntohl(cmd.param));
			rtlsdr_set_direct_sampling(dev, ntohl(cmd.param));
			break;
		case 0x0a:
			printf("set offset tuning %d\n", ntohl(cmd.param));
			rtlsdr_set_offset_tuning(dev, ntohl(cmd.param));
			break;
		case 0x0b:
			printf("set rtl xtal %d\n", ntohl(cmd.param));
			rtlsdr_set_xtal_freq(dev, ntohl(cmd.param), 0);
			break;
		case 0x0c:
			printf("set tuner xtal %d\n", ntohl(cmd.param));
			rtlsdr_set_xtal_freq(dev, 0, ntohl(cmd.param));
			break;
		case 0x0d:
			printf("set tuner gain by index %d\n", ntohl(cmd.param));
			set_gain_by_index(dev, ntohl(cmd.param));
			break;
		default:
			break;
		}
		cmd.cmd = 0xff;*/