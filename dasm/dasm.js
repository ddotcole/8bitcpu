//Reset count to zero for array traversal
instruction.PRN.count = 0;
//Sanitize array and create jump address object in instruction
for(i = 0; i in array; i++) {
  // Find/remove all labels and create associated addresses in instruction.address
  if(array[i].trim().substring(0,1) == ":"){  
    // Remove leading : character, split on comment marker and trim white space
    let line = array[i].substring(1).split("//")[0].trim()  
    instruction.address[line] = `${hex((i) * 1, 4, 10)}`
    array.splice(i, 1)
    i = i - 1
  }else if(array[i].trim().substr(0,2) == "//"){  
    // Remove comments that are on lines by themselves  
    array.splice(i, 1)
    i = i - 1
  }else if(!array[i].trim()){
    array.splice(i, 1)
    i = i - 1
  }else if(array[i].trim().substr(0,3) == "PRN"){
    // Remove leading : character, split on comment marker and trim white space
    let line = `PRN${instruction.PRN.count}`  
    instruction.PRN.count += 1
    instruction.address[line] = `${hex((i) * 1, 4, 10)}`
  }
}

//Create prn array to contain instructions to add at the end of the main code body
var prn = [];

//Reset count to zero for array traversal
instruction.PRN.count = 0;

//Traverse array for PRN to generate STR **,EP array
for(i = 0; i in array; i++) {
  if(array[i].trim().substr(0,3) == "PRN"){
    let line = `STRING${instruction.PRN.count}`  
    console.log(array.length)
    console.log(prn.length / 4)
    instruction.address[line] = hex(prn.length / 4 + array.length, 4, 10)
    let string = array[i].split("\"")[1]
    let output = []
    for(c = 0; c < string.length; c++){
      output[c*4] = `${hex("000" + "11010", 2, 2)}`,
      output[c*4+1] = `${hex("000" + "000" + "01", 2, 2)}`,
      output[c*4+2] = `${hex(string.charCodeAt(c), 2, 10)}`,
      output[c*4+3] = `00`
    }
    /* Calculate return address to jump back to after array of STR **,EP
    and add this to output array*/
    let addr = hex(+instruction.address[`PRN${instruction.PRN.count}`] + 1, 4, 10)
    output[output.length] = `1A`,
    output[output.length] = `01`,
    output[output.length] = `0D`,
    output[output.length] = `00`,
    output[output.length] = `08`,
    output[output.length] = `00`,
    output[output.length] = `${addr.substring(2, 4)}`,
    output[output.length] = `${addr.substring(0, 2)}`
    instruction.PRN.count = instruction.PRN.count + 1
    prn = prn.concat(output)
  }
}

//Reset count to zero for array traversal
instruction.PRN.count = 0;
//Compile DASM code now contained in array
for(i = 0; i in array; i++) {  
  let line = array[i].split("//")[0].trim()
  let instr = line.split(' ')[0]
  if(instr.trim() in instruction ) {
    let args = 0;
    if(line.split(' ')[1]) {
      args = line.split(' ')[1].split(',');
    }
    let ctrlword = instruction[instr].compile(args)
    console.log(`${instr} Address:${hex(i * 1, 2, 10)}  Opcode: ${ctrlword}`)
    if(ctrlword && !ctrlword.includes("NaN")){
        writeByte1.write(`${ctrlword[0]}\n`);
        writeByte2.write(`${ctrlword[1]}\n`);
        writeByte3.write(`${ctrlword[2]}\n`);
        writeByte4.write(`${ctrlword[3]}\n`);
    }else{
      console.log(array[i])
      console.log(`Syntax error: arguments not valid on line ${array.indexOf(array[i])+1}`)
    }
  }else {
    console.log(array[i])
    console.log(`Syntax error: instruction ${instr} not valid on line ${array.indexOf(array[i])+1}`)
  }
}

//Write prn array to file
for(i = 0; i in prn;) {  
  writeByte1.write(`${prn[i]}\n`);
  writeByte2.write(`${prn[i+1]}\n`);
  writeByte3.write(`${prn[i+2]}\n`);
  writeByte4.write(`${prn[i+3]}\n`);
  i += 4
}
