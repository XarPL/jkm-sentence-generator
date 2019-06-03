const sampleRate = 48100;

function writeString(dataview, offset, header) {
	for (var i = 0; i < header.length; i++) {
		dataview.setUint8(offset + i, header.charCodeAt(i));
	}
}

function floatTo16BitPCM(dataview, buffer, offset) {
	for (var i = 0; i < buffer.length; i++, offset += 2) {
		var tmp = Math.max(-1, Math.min(1, buffer[i]));
		
		dataview.setInt16(offset, tmp < 0 ? tmp * 0x8000 : tmp * 0x7fff, true);
	}
	
	return dataview;
}

function writeHeaders(buffer) {
    var arrayBuffer = new ArrayBuffer(44 + buffer.length * 2);
	
    var view = new DataView(arrayBuffer);

    writeString(view, 0, "RIFF");
	
    view.setUint32(4, 32 + buffer.length * 2, true);
	
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
	
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 2, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
	
    writeString(view, 36, "data");
	
    view.setUint32(40, buffer.length * 2, true);

    return floatTo16BitPCM(view, buffer, 44);
}

function interleave(input) {
	var buffer = input.getChannelData(0);
	var length = buffer.length * 2;
	var result = new Float32Array(length);
	var index = 0;
	var inputIndex = 0;

	while (index < length) {
		result[index++] = buffer[inputIndex];
		result[index++] = buffer[inputIndex];
		
		inputIndex++;
	}
	
	return result;
}

async function concatSounds (filepaths) {
	var context = new AudioContext();
				  
	const files = filepaths.map(async filepath => {
		const buffer = await fetch(filepath).then(response =>
			response.arrayBuffer()
		);

		return context.decodeAudioData(buffer);
    });
		
    var buffers = await Promise.all(files);	
	
	var output = context.createBuffer(1, buffers.map(buffer => buffer.length).reduce((a, b) => a + b, 0), sampleRate);		
	var offset = 0;
	
	buffers.map(buffer => {
		output.getChannelData(0).set(buffer.getChannelData(0), offset);
		offset += buffer.length;
	});
	
	const source = context.createBufferSource();
		  source.buffer = output;
		  source.connect(context.destination);
		  source.start();
		  
    const recorded = interleave(output);
    const dataview = writeHeaders(recorded);
    const audioBlob = new Blob([dataview], { type: "audio/mp3" });
	  
	const a = document.createElement("a");
		  a.href = window.URL.createObjectURL(audioBlob);
		  a.download = "test";
		  a.click();
}
