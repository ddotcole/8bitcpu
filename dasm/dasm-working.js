/* 
Dave's Assembly Language Compiler
*/
const { Console } = require('console')
const fs = require('fs')

/*
Main Object
*/
var cpu = {
  instruction: {
    wait: {
      compile : (args) => {
        // wait -- Burn one clock cycle doing nothing
        return [
          `00`,
          `00`,
          `00`,
          `00`
        ]
      }
    },
    halt: {
      compile : (args) => {
        // halt -- Stop operation of the computer
        return [
          `01`,
          `00`,
          `00`,
          `00`
        ]
      }
    },
    reset: {
      compile : (args) => {
        // reset -- Stop operation of the computer
        return [
          `02`,
          `00`,
          `00`,
          `00`
        ]
      }
    },
    load: {
      compile : (args) => {
        // load iAB,B
        if( args[0] in cpu.address.ram && /B/.test(args[1]) ){  
          let opcode = 0x04
          let imm = 0x00
          let mar = 0x00
          return [
            `${hex(mar + imm + opcode,2)}`,
            `00`,
            `${cpu.address.ram[args[0]].substring(2, 4)}`,
            `${cpu.address.ram[args[0]].substring(0, 2)}`
          ]
        }
        // load iAB,R
        else if( args[0] in cpu.address.ram && /R/.test(args[1]) ){  
          let opcode = 0x03
          let imm = 0x00
          let mar = 0x00
          return [
            `${hex(mar + imm + opcode,2)}`,
            `00`,
            `${cpu.address.ram[args[0]].substring(2, 4)}`,
            `${cpu.address.ram[args[0]].substring(0, 2)}`
          ]
        }
        // load iAB,IMM
        else if( args[0] in cpu.address.ram && hex(args[1],2) !== '' ){  
          let opcode = 0x04
          let imm = 0x40
          let mar = 0x00
          return [
            `${hex(mar + imm + opcode,2)}`,
            `${hex(args[1],2)}`,
            `${cpu.address.ram[args[0]].substring(2, 4)}`,
            `${cpu.address.ram[args[0]].substring(0, 2)}`
          ]
        }
        // load iAB,EP
        else if( args[0] in cpu.address.ram && /EP/.test(args[1]) ){  
          let opcode = 0x05
          let imm = 0x00
          let mar = 0x00
          return [
            `${hex(mar + imm + opcode,2)}`,
            `00`,
            `${cpu.address.ram[args[0]].substring(2, 4)}`,
            `${cpu.address.ram[args[0]].substring(0, 2)}`
          ]
        }
        // load MAR,B
        else if( /MAR/.test(args[0]) && /B/.test(args[1]) ){  
          let opcode = 0x04
          let imm = 0x00
          let mar = 0x80
          return [
            `${hex(mar + imm + opcode,2)}`,
            `00`,
            `00`,
            `00`,
          ]
        }
        // load MAR,R
        else if( /MAR/.test(args[0]) && /R/.test(args[1]) ){  
          let opcode = 0x03
          let imm = 0x00
          let mar = 0x80
          return [
            `${hex(mar + imm + opcode,2)}`,
            `00`,
            `00`,
            `00`,
          ]
        }
        // load MAR,IMM
        else if( /MAR/.test(args[0]) && hex(args[1],2) !== '' ){  
          let opcode = 0x04
          let imm = 0x40
          let mar = 0x80
          return [
            `${hex(mar + imm + opcode,2)}`,
            `${hex(args[1],2)}`,
            `00`,
            `00`
          ]
        }
        // load MAR,iAB
        else if( /MAR/.test(args[0]) && args[1] in cpu.address.ram ){  
          let opcode = 0x06
          return [
            `${hex(opcode,2)}`,
            `00`,
            `${cpu.address.ram[args[1]].substring(2, 4)}`,
            `${cpu.address.ram[args[1]].substring(0, 2)}`
          ]
        }
        // Errors
        else{
          console.log('Invalid source arguments')
        }
      }
    },
    store: {
      compile : (args) => {
        // store iAB,B
        if( args[0] in cpu.address.ram && /B/.test(args[1]) ){  
          let opcode = 0x07
          let imm = 0x00
          let mar = 0x00
          return [
            `${hex(mar + imm + opcode,2)}`,
            `00`,
            `${cpu.address.ram[args[0]].substring(2, 4)}`,
            `${cpu.address.ram[args[0]].substring(0, 2)}`
          ]
        }
        // store iAB,EP
        else if( args[0] in cpu.address.ram && /EP/.test(args[1]) ){  
          let opcode = 0x08
          let imm = 0x00
          let mar = 0x00
          return [
            `${hex(mar + imm + opcode,2)}`,
            `00`,
            `${cpu.address.ram[args[0]].substring(2, 4)}`,
            `${cpu.address.ram[args[0]].substring(0, 2)}`
          ]
        }
        // store MAR,B
        else if( /MAR/.test(args[0]) && /B/.test(args[1]) ){  
          let opcode = 0x07
          let imm = 0x00
          let mar = 0x80
          return [
            `${hex(mar + imm + opcode,2)}`,
            `00`,
            `00`,
            `00`,
          ]
        }
        // store MAR,EP
        else if( /MAR/.test(args[0]) && /EP/.test(args[1]) ){  
          let opcode = 0x08
          let imm = 0x00
          let mar = 0x80
          return [
            `${hex(mar + imm + opcode,2)}`,
            `00`,
            `00`,
            `00`
          ]
        }
        // Errors
        else{
          console.log('Invalid source arguments')
        }
      }
    },
    jump: {
        compile : (args) => {
          // jump label -- Jump directly to LABEL
          let opcode = 0x09
          return [
          `${hex(opcode,2)}`,
          `00`,
          `${cpu.address.rom[args].substring(2, 4)}`,
          `${cpu.address.rom[args].substring(0, 2)}`
        ]
      }
    },
    jcbf: {
      compile : (args) => {
        // jcbf label
        let opcode = 0x0A
        return [
        `${hex(opcode,2)}`,
        `00`,
        `${cpu.address.rom[args].substring(2, 4)}`,
        `${cpu.address.rom[args].substring(0, 2)}`
      ]
    }
    },
    clear: {
      compile : (args) => {
        // clear cbf
        let opcode = 0x0B
        if( /cbf/.test(args[0]) ){
          return [
            `${hex(opcode,2)}`,
            `00`,
            `00`,
            `00`
          ]
        }
        // Errors
        else{
          console.log('Invalid source arguments')
        }
      } 
    },
    brlt: {
      compile : (args) => {
        // brlt R,B,label
        if( /R/.test(args[0]) && /B/.test(args[1]) && args[2] in cpu.address.rom ){  
          let opcode = 0x0C
          let imm = 0x00
          return [
            `${hex(imm + opcode,2)}`,
            `00`,
            `${cpu.address.rom[args[2]].substring(2, 4)}`,
            `${cpu.address.rom[args[2]].substring(0, 2)}`
          ]
        }
        // brlt R,IMM,label
        else if( /R/.test(args[0]) && hex(args[1],2) !== '' && args[2] in cpu.address.rom ){  
          let opcode = 0x0C
          let imm = 0x40
          return [
            `${hex(imm + opcode,2)}`,
            `${hex(args[1],2)}`,
            `${cpu.address.rom[args[2]].substring(2, 4)}`,
            `${cpu.address.rom[args[2]].substring(0, 2)}`
          ]
        }
        // Errors
        else{
          console.log('Invalid source arguments')
        }
      }
    },
    breq: {
      compile : (args) => {
        // breq R,B,label
        if( /R/.test(args[0]) && /B/.test(args[1]) && args[2] in cpu.address.rom ){  
          let opcode = 0x0D
          let imm = 0x00
          return [
            `${hex(imm + opcode,2)}`,
            `00`,
            `${cpu.address.rom[args[2]].substring(2, 4)}`,
            `${cpu.address.rom[args[2]].substring(0, 2)}`
          ]
        }
        // breq R,IMM,label
        else if( /R/.test(args[0]) && hex(args[1],2) !== '' && args[2] in cpu.address.rom ){  
          let opcode = 0x0D
          let imm = 0x40
          return [
            `${hex(imm + opcode,2)}`,
            `${hex(args[1],2)}`,
            `${cpu.address.rom[args[2]].substring(2, 4)}`,
            `${cpu.address.rom[args[2]].substring(0, 2)}`
          ]
        }
        // Errors
        else{
          console.log('Invalid source arguments')
        }
      }
    },
    brgt: {
      compile : (args) => {
        // brgt R,B,label
        if( /R/.test(args[0]) && /B/.test(args[1]) && args[2] in cpu.address.rom ){  
          let opcode = 0x0E
          let imm = 0x00
          return [
            `${hex(imm + opcode,2)}`,
            `00`,
            `${cpu.address.rom[args[2]].substring(2, 4)}`,
            `${cpu.address.rom[args[2]].substring(0, 2)}`
          ]
        }
        // brgt R,IMM,label
        else if( /R/.test(args[0]) && hex(args[1],2) !== '' && args[2] in cpu.address.rom ){  
          let opcode = 0x0E
          let imm = 0x40
          return [
            `${hex(imm + opcode,2)}`,
            `${hex(args[1],2)}`,
            `${cpu.address.rom[args[2]].substring(2, 4)}`,
            `${cpu.address.rom[args[2]].substring(0, 2)}`
          ]
        }
        // Errors
        else{
          console.log('Invalid source arguments')
        }
      }
    },
    add: {
      compile : (args) => {
        // add iAB,B
        if( args[0] in cpu.address.ram && /B/.test(args[1]) ){  
          let opcode = 0x0F
          let imm = 0x00
          let mar = 0x00
          return [
            `${hex(mar + imm + opcode,2)}`,
            `00`,
            `${cpu.address.ram[args[0]].substring(2, 4)}`,
            `${cpu.address.ram[args[0]].substring(0, 2)}`
          ]
        }
        // add iAB,IMM
        else if( args[0] in cpu.address.ram && hex(args[1],2) !== '' ){  
          let opcode = 0x0F
          let imm = 0x40
          let mar = 0x00
          return [
            `${hex(mar + imm + opcode,2)}`,
            `${hex(args[1],2)}`,
            `${cpu.address.ram[args[0]].substring(2, 4)}`,
            `${cpu.address.ram[args[0]].substring(0, 2)}`
          ]
        }
        // add MAR,B
        else if( /MAR/.test(args[0]) && /B/.test(args[1]) ){  
          let opcode = 0x0F
          let imm = 0x00
          let mar = 0x80
          return [
            `${hex(mar + imm + opcode,2)}`,
            `00`,
            `00`,
            `00`,
          ]
        }
        // add MAR,IMM
        else if( /MAR/.test(args[0]) && hex(args[1],2) !== '' ){  
          let opcode = 0x0F
          let imm = 0x40
          let mar = 0x80
          return [
            `${hex(mar + imm + opcode,2)}`,
            `${hex(args[1],2)}`,
            `00`,
            `00`
          ]
        }
        // Errors
        else{
          console.log('Invalid source arguments')
        }
      } 
    },
    sub: {
      compile : (args) => {
        // SUB P1,i,PW -- Subtract immediate i from P1 and store in PW
        if(/^[0-9A-Fa-f]{2}$/.test(args[1])){
          return [
            `${hex("000" + "10001", 2, 2)}`, // Step 1
            `${hex(bin(reg[args[2]], 3) + bin(reg[args[0]], 3) + "01", 2, 2)}`,
            `${args[1]}`,
            `00`
          ]
        }
        // SUB P1,P2,PW,LABEL -- Subtract P2 from P1 and store in PW, if carry flag set jump to LABEL
        else if(/^[0-9A-Fa-f]{4}$/.test(instruction.address[args[3]])){
          return [
            `${hex(bin(reg[args[1]], 3) + "10010", 2, 2)}`, // Step 1
            `${hex(bin(reg[args[2]], 3) + bin(reg[args[0]], 3) + "00", 2, 2)}`,
            `${instruction.address[args[3]].substring(2, 4)}`,
            `${instruction.address[args[3]].substring(0, 2)}`
          ]
        }  
        // SUB P1,P2,PW -- Subtract P2 from P1 and store in PW
        else if(/^[A-F]{1}$/.test(args[1])){
          return [
            `${hex(bin(reg[args[1]], 3) + "10001", 2, 2)}`, // Step 1
            `${hex(bin(reg[args[2]], 3) + bin(reg[args[0]], 3) + "00", 2, 2)}`,
            `00`,
            `00`
          ]
        }
        // Error
        else {
          console.log('Invalid arguments')
        }
      } 
    },
    and: {
      compile : (args) => {
        // AND P1,i,PW -- Logical AND P1 with immediate i and store in PW
        if(/^[0-9A-Fa-f]{2}$/.test(args[1])){
          return [
            `${hex("000" + "10011", 2, 2)}`, // Step 1
            `${hex(bin(reg[args[2]], 3) + bin(reg[args[0]], 3) + "01", 2, 2)}`,
            `${args[1]}`,
            `00`
          ]
        }
        // AND P1,P2,PW -- Logical AND P1 with P2 and store in PW
        else if(/^[A-F]{1}$/.test(args[1])){
          return [
            `${hex(bin(reg[args[1]], 3) + "10011", 2, 2)}`, // Step 1
            `${hex(bin(reg[args[2]], 3) + bin(reg[args[0]], 3) + "00", 2, 2)}`,
            `00`,
            `00`
          ]
        }
        // Errors
        else {
          console.log('Invalid arguments')
        }
      }
    },
    nand: {
      compile : (args) => {
        // NND P1,i,PW -- Logical NAND P1 with immediate i and store in PW
        if(/^[0-9A-Fa-f]{2}$/.test(args[1])){
          return [
            `${hex("000" + "10100", 2, 2)}`, // Step 1
            `${hex(bin(reg[args[2]], 3) + bin(reg[args[0]], 3) + "01", 2, 2)}`,
            `${args[1]}`,
            `00`
          ]
        }
        // NND P1,P2,PW -- Logical NAND P1 with P2 and store in PW
        else if(/^[A-F]{1}$/.test(args[1])){
          return [
            `${hex(bin(reg[args[1]], 3) + "10100", 2, 2)}`, // Step 1
            `${hex(bin(reg[args[2]], 3) + bin(reg[args[0]], 3) + "00", 2, 2)}`,
            `00`,
            `00`
          ]
        }
        // Errors
        else {
          console.log('Invalid arguments')
        }
      }
    },
    or: {
      compile : (args) => {
        // ORR P1,i,PW -- Logical OR P1 with immediate i and store in PW
        if(/^[0-9A-Fa-f]{2}$/.test(args[1])){
          return [
            `${hex("000" + "10101", 2, 2)}`, // Step 1
            `${hex(bin(reg[args[2]], 3) + bin(reg[args[0]], 3) + "01", 2, 2)}`,
            `${args[1]}`,
            `00`
          ]
        }
        // ORR P1,P2,PW -- Logical OR P1 with P2 and store in PW
        else if(/^[A-F]{1}$/.test(args[1])){
          return [
            `${hex(bin(reg[args[1]], 3) + "10101", 2, 2)}`, // Step 1
            `${hex(bin(reg[args[2]], 3) + bin(reg[args[0]], 3) + "00", 2, 2)}`,
            `00`,
            `00`
          ]
        }
        // Errors
        else {
          console.log('Invalid arguments')
        }
      }
    },
    nor: {
      compile : (args) => {
        // NOR P1,i,PW         // Logical NOR P1 with immediate i and store in PW
        if(/^[0-9A-Fa-f]{2}$/.test(args[1])){
          return [
            `${hex("000" + "10110", 2, 2)}`, // Step 1
            `${hex(bin(reg[args[2]], 3) + bin(reg[args[0]], 3) + "01", 2, 2)}`,
            `${args[1]}`,
            `00`
          ]
        }
        // NOR P1,P2,PW        // Logical NOR P1 with P2 and store in PW
        else if(/^[A-F]{1}$/.test(args[1])){
          return [
            `${hex(bin(reg[args[1]], 3) + "10110", 2, 2)}`, // Step 1
            `${hex(bin(reg[args[2]], 3) + bin(reg[args[0]], 3) + "00", 2, 2)}`,
            `00`,
            `00`
          ]
        }
        // Errors
        else {
          console.log('Invalid arguments')
        }
      }
    },
    xor: {
      compile : (args) => {
        // XOR P1,i,PW -- Logical XOR P1 with immediate i and store in PW
        if(/^[0-9A-Fa-f]{2}$/.test(args[1])){
          return [
            `${hex("000" + "10111", 2, 2)}`, // Step 1
            `${hex(bin(reg[args[2]], 3) + bin(reg[args[0]], 3) + "01", 2, 2)}`,
            `${args[1]}`,
            `00`
          ]
        }
        // XOR P1,P2,PW -- Logical XOR P1 with P2 and store in PW
        else if(/^[A-F]{1}$/.test(args[1])){
          return [
            `${hex(bin(reg[args[1]], 3) + "10111", 2, 2)}`, // Step 1
            `${hex(bin(reg[args[2]], 3) + bin(reg[args[0]], 3) + "00", 2, 2)}`,
            `00`,
            `00`
          ]
        }
        // Errors
        else {
          console.log('Invalid arguments')
        }
      }
    },
    not: {
      compile : (args) => {
        // NOT P2,PW -- Logical NOT P2 and store it in PW
        return [
          `${hex(bin(reg[args[0]], 3) + "11000", 2, 2)}`,
          `${hex(bin(reg[args[1]], 3) + "000" + "00", 2, 2)}`,
          `00`,
          `00`
        ]
      }
    },
    print: {
      count: 0,
      compile : (args) => {
        /*  PRN "This is a string"
        
        This instruction registers two address's for jumps, one to an cpu.program.file of STR i,EP
        instructions at the end of the main code write and the other jump at the end of
        this cpu.program.file back to where it was called from.
  
        The first jump will be returned from this routine.
        */
        instruction.PRN.count += 1 
        return [
          `08`,
          `00`,
          `${instruction.address[`STRING${instruction.PRN.count - 1}`].substring(2, 4)}`,
          `${instruction.address[`STRING${instruction.PRN.count - 1}`].substring(0, 2)}`
        ]
      }
    }
  },
  program: {
    file: [],
    code: [],
    write: []
  },
  address: {
    ram: {
      pointer: 0x0010
    },
    rom: {
      pointer: 0x0000
    }
  },
  register: {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: 5,
    f: 6,
    g: 7
  },
  macro: {

  }
} 

/* 
Process command line arguments and initalize
*/
if(process.argv.length > 2){
  if(`${process.argv[2].split('.')[1]}` !== 'dasm'){
    console.log("\nIncorrect file extension.  Make sure the file extension ends with \".dasm\".\n")
    process.exit(1);
  } 
  cpu.program.file = fs.readFileSync(process.argv[2]).toString().split("\r\n")
  cpu.program.code = [...cpu.program.file]

  let fileName = process.argv[2].split('.')[0]

  cpu.program.byte1 = fs.createWriteStream(`rom/${fileName}/byte1.hex`)  
  cpu.program.byte2 = fs.createWriteStream(`rom/${fileName}/byte2.hex`) 
  cpu.program.byte3 = fs.createWriteStream(`rom/${fileName}/byte3.hex`)
  cpu.program.byte4 = fs.createWriteStream(`rom/${fileName}/byte4.hex`)

  cpu.program.byte1.write(`v2.0 raw\n`)
  cpu.program.byte2.write(`v2.0 raw\n`) 
  cpu.program.byte3.write(`v2.0 raw\n`)
  cpu.program.byte4.write(`v2.0 raw\n`)
}else {
  console.log("\nThe correct usage of this program is \"node dasm.js <file>.dasm\"\n")
  process.exit(1);
}

/*
First Pass (RAM Address Creation)
*/
cpu.program.code.push(`:!@#$%^&*()`)
cpu.program.code.unshift(`  jump !@#$%^&*()`)
for(i = 0; i in cpu.program.code; i++) {
  let line = cpu.program.code[i].split("//")[0].trim()
  let args = line.split(' ')[1]

  if(line.substring(0,4) == ".var"){
    let name = args.split(',')[0]
    let value = args.split(',')[1]
    cpu.address.ram[name] = hex(cpu.address.ram.pointer,4)
    cpu.address.ram.pointer++
    cpu.program.code.splice(i, 1)
    i = i - 1
    cpu.program.code.push(`  load ${name},${value}`)
  }else if(line.substring(0,4) == ".buf"){  
    let name = args.split(',')[0]
    let size = args.split(',')[1]
    cpu.address.ram[name] = hex(cpu.address.ram.pointer,4)
    cpu.address.ram.pointer += parseInt(hex(size,4),16) + 1
    cpu.program.code.splice(i, 1)
    i = i - 1
  }else if(line.substring(0,4) == ".str"){  
    // Create address in cpu.address.ram   
    cpu.program.code.splice(i, 1)
    i = i - 1
  }else if(line.substr(0,2) == "//"){  
    cpu.program.code.splice(i, 1)
    i = i - 1
  }else if(!line){
    cpu.program.code.splice(i, 1)
    i = i - 1
  }
}
cpu.program.code.push(`  jump start`)
console.log(cpu.program.code)

/*
Second Pass (ROM Address Creation)
*/
for(i = 0; i in cpu.program.code; i++) {
  if(cpu.program.code[i].trim().substring(0,1) == ":"){  
    // Remove leading : character, split on comment marker and trim white space
    let line = cpu.program.code[i].substring(1).split("//")[0].trim()  
    cpu.address.rom[line] = `${hex((i + cpu.address.rom.pointer) * 1, 4)}` 
    cpu.program.code.splice(i, 1)
    i = i - 1
  }
}

/*
Compile
*/
for(i = 0; i in cpu.program.code; i++) {
  let line = cpu.program.code[i].split("//")[0].trim()
  let instr = line.split(' ')[0]
  if(instr.trim() in cpu.instruction ) {
    let args = 0;
    if(line.split(' ')[1]) {
      args = line.split(' ')[1].split(',');
    }
    let ctrlword = cpu.instruction[instr].compile(args)
    console.log(`${instr} Address:${hex(i * 1, 2, 10)}  Opcode: ${ctrlword}`)
    if(ctrlword && !ctrlword.includes("NaN")){
        cpu.program.write.push(ctrlword[0])
        cpu.program.write.push(ctrlword[1])
        cpu.program.write.push(ctrlword[2])
        cpu.program.write.push(ctrlword[3])
    }else{
      console.log(cpu.program.write[i])
      console.log(`Syntax error: arguments not valid on line ${'*FIX*'}`)
    }
  }else {
    console.log(`Syntax error: instruction ${instr} not valid on line ${'*FIX*'}`)
  }
}

/*
Write out buffers to HEX files
*/
for(i = 0; i in cpu.program.write;){
  cpu.program.byte1.write(`${cpu.program.write[i]}\n`);
  cpu.program.byte2.write(`${cpu.program.write[i + 1]}\n`);
  cpu.program.byte3.write(`${cpu.program.write[i + 2]}\n`);
  cpu.program.byte4.write(`${cpu.program.write[i + 3]}\n`);
  i = i + 4
}

/*
Housekeeping functions
*/
function hex(num, pad){
  if(/^0b/.test(num)){
    return parseInt(num.substring(2), 2).toString(16).padStart(pad, '0');
  }else if(/^0x/.test(num)){
    return parseInt(num.substring(2), 16).toString(16).padStart(pad, '0');
  }else if(/^[0-9]+$/.test(num)){
    return parseInt(num, 10).toString(16).padStart(pad, '0');
  }else {
    return '';
  }
}

console.log(cpu.address.ram)
console.log(cpu.address.rom)