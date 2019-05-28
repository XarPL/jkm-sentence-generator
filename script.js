function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
function losu_start() 
{
	var sentence = document.getElementById("sentenceBox");
        sentence.innerHTML = "&quot;"+w1[Math.floor(getRandomArbitrary(0, w1.length))] + w2[Math.floor(getRandomArbitrary(0, w2.length))] + w3[Math.floor(getRandomArbitrary(0, w3.length))] + w4[Math.floor(getRandomArbitrary(0, w4.length))] + w5[Math.floor(getRandomArbitrary(0, w5.length))] + w6[Math.floor(getRandomArbitrary(0, w6.length))] +"&quot;";
}