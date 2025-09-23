`timescale 1ns / 1ps
//////////////////////////////////////////////////////////////////////////////////
// Company: psu
// Engineer: Samit Madatanapalli
//
// Create Date: 08/14/2024 05:07:58 PM
// Design Name:
// Module Name: datapath
// Project Name:
// Target Devices:
// Tool Versions:
// Description:
//
// FINAL PROJECT 5 STAGE PIPELINE WITH HAZARDS, FORWARDING
//////////////////////////////////////////////////////////////////////////////////
module datapath(
    input clk
    );
    
    wire [31:0] pc, nextPc, aluOut_b, memOut_b, writeData, inst, inst_d, regOut1, regOut2, imm32, regOut1_x, regOut2_x, imm32_x, aluOut_m, regOut2_m, regOut1_f, regOut2_f, aluIn2, aluOut, memOut;
    wire [4:0] writeAddr_b, readAddr1, readAddr2, writeAddr, rs_x, rt_x, rd_x, writeAddr_m;
    wire [3:0] aluControl, aluControl_x;
    wire [1:0] forwardA, forwardB;
    wire regWrite_b, memToReg_b, regWrite, memToReg, memWrite, aluSrc, regDst, memRead, 
    regWrite_x, memToReg_x, memWrite_x, aluSrc_x, regDst_x, memRead_x,
    regWrite_m, memToReg_m, memWrite_m, memRead_m, stall;

    // IF
    program_counter pcmodule(.clk(clk), .stall(stall), .nextPc(nextPc), .pc(pc));
    pc_adder pa(.pc(pc), .offset(32'd4), .nextPc(nextPc));
    inst_mem im(.pc(pc), .inst(inst));
    if_id ifid(.clk(clk), .stall(stall), .inst(inst), .inst_d(inst_d));

    // ID
    control_unit cu(.op(inst_d[31:26]), .func(inst_d[5:0]),.stall(stall),.regWrite(regWrite),.memToReg(memToReg),.memWrite(memWrite),.aluSrc(aluSrc),.regDst(regDst),.memRead(memRead),.aluControl(aluControl));
    register_file rf(.clk(clk),.readAddr1(inst_d[25:21]),.readAddr2(inst_d[20:16]),.writeAddr(writeAddr_b),.writeData(writeData),.regWrite(regWrite_b),.regOut1(regOut1),.regOut2(regOut2));
    imm_extend ie(.imm(inst_d[15:0]), .imm32(imm32));
    id_ex idex(.clk(clk),.regWrite(regWrite),.memToReg(memToReg),.memWrite(memWrite),.aluSrc(aluSrc),.regDst(regDst),.memRead(memRead),.regOut1(regOut1),.regOut2(regOut2),.imm32(imm32),.rs(inst_d[25:21]),.rt(inst_d[20:16]),.rd(inst_d[15:11]),.aluControl(aluControl),
        .memToReg_x(memToReg_x),.regOut1_x(regOut1_x),.memWrite_x(memWrite_x),.aluSrc_x(aluSrc_x),.regWrite_x(regWrite_x),.regDst_x(regDst_x),.memRead_x(memRead_x),.regOut2_x(regOut2_x),.imm32_x(imm32_x),.rs_x(rs_x),.rt_x(rt_x),.rd_x(rd_x),.aluControl_x(aluControl_x)
    );

    // Hazard + Forwarding
    hazard_reg hu(.rt_x(rt_x),.rs_d(inst_d[25:21]),.rt_d(inst_d[20:16]),.memRead_x(memRead_x),.stall(stall));
    forward_reg fu(.writeAddr_m(writeAddr_m),.writeAddr_b(writeAddr_b),.rs_x(rs_x),.rt_x(rt_x),.regWrite_b(regWrite_b),.regWrite_m(regWrite_m),.forwardA(forwardA),.forwardB(forwardB));
    mux_3x1_32b muxFA(.in0(regOut1_x),.in1(writeData),.in2(aluOut_m),.sel(forwardA),.out(regOut1_f));
    mux_3x1_32b muxFB(.in0(regOut2_x),.in1(writeData),.in2(aluOut_m),.sel(forwardB),.out(regOut2_f));

    // EX
    alu au(.aluIn1(regOut1_f),.aluIn2(aluIn2),.aluOut(aluOut),.aluControl(aluControl_x));
    mux_2x1_32b mu32(.in0(regOut2_f),.in1(imm32_x),.sel(aluSrc_x),.out(aluIn2));
    mux_2x1_5b mu32ADDER(.in0(rt_x),.in1(rd_x),.sel(regDst_x),.out(writeAddr));
    ex_mem exmem(.clk(clk),
        .regWrite_x(regWrite_x),.memWrite_x(memWrite_x),.memRead_x(memRead_x),.aluOut(aluOut),.regOut2_x(regOut2_f),.memToReg_x(memToReg_x),.writeAddr(writeAddr),
        .regWrite_m(regWrite_m),.memWrite_m(memWrite_m),.memRead_m(memRead_m),.aluOut_m(aluOut_m),.regOut2_m(regOut2_m),.memToReg_m(memToReg_m),.writeAddr_m(writeAddr_m)
    );

    // MEM
    data_mem dm(.clk(clk),.memWrite(memWrite_m),.memRead(memRead_m),.addr(aluOut_m),.memIn(regOut2_m),.memOut(memOut));
    mem_wb memwb(.clk(clk),
        .regWrite_m(regWrite_m),.aluOut_m(aluOut_m),.memOut(memOut),.memToReg_m(memToReg_m),.writeAddr_m(writeAddr_m),
        .regWrite_b(regWrite_b),.aluOut_b(aluOut_b),.memOut_b(memOut_b),.memToReg_b(memToReg_b),.writeAddr_b(writeAddr_b)
    );
    mux_2x1_32b mu32WB(.in0(aluOut_b),.in1(memOut_b),.sel(memToReg_b),.out(writeData));
endmodule

//  ===== Modules (trimmed copy of your provided source) =====
module program_counter(input clk, stall, input [31:0] nextPc, output reg [31:0] pc);
  initial pc = 32'd96; 
  always @(posedge clk) if (!stall) pc <= nextPc;
endmodule

module pc_adder(input [31:0] pc, offset, output reg [31:0] nextPc);
  always @(*) nextPc <= pc + offset;
endmodule

module inst_mem(input [31:0] pc, output reg [31:0] inst);
  reg [31:0] memory [0:63];
  initial begin      
    memory[25] = {6'b100011, 5'd0, 5'd1, 16'd0};
    memory[26] = {6'b100011, 5'd0, 5'd2, 16'd4};
    memory[27] = {6'b000000, 5'd1, 5'd2, 5'd3, 11'b00000100010};
    memory[28] = {6'b100011, 5'd3, 5'd4, 16'hFFFC};
  end
  always @(*) inst <= memory[pc[31:2]];
endmodule

module register_file(input [4:0] readAddr1, readAddr2, writeAddr, input [31:0] writeData, input regWrite, clk, output reg [31:0] regOut1, regOut2);
  reg [31:0] register [0:31]; integer i; initial for (i=0;i<32;i=i+1) register[i]=32'd0;
  always @(*) begin regOut1 <= register[readAddr1]; regOut2 <= register[readAddr2]; end
  always @(negedge clk) if (regWrite) register[writeAddr] <= writeData;
endmodule

module control_unit(input stall, input [5:0] op, func, output reg regWrite, memToReg, memWrite, aluSrc, regDst, memRead, output reg [3:0] aluControl);
  always @(*) begin
    if (stall) begin regWrite=0; memToReg=0; aluSrc=0; regDst=0; memRead=0; memWrite=0; aluControl=3'b000; end
    else if(op==6'b000000 & func==6'b100000) begin regWrite=1; memToReg=0; aluSrc=0; regDst=1; memRead=0; memWrite=0; aluControl=3'b010; end
    else if(op==6'b000000 & func==6'b100010) begin regWrite=1; memToReg=0; aluSrc=0; regDst=1; memRead=0; memWrite=0; aluControl=3'b110; end
    else if(op==6'b100011) begin regWrite=1; memToReg=1; aluSrc=1; regDst=0; memRead=1; memWrite=0; aluControl=3'b010; end
    else if(op==6'b101011) begin regWrite=0; memToReg=1'bx; aluSrc=1; regDst=1'bx; memRead=0; memWrite=1; aluControl=3'b010; end
    else begin regWrite=0; memToReg=0; aluSrc=0; regDst=0; memRead=0; memWrite=0; aluControl=3'bxxx; end
  end
endmodule

module imm_extend(input [15:0] imm, output reg [31:0] imm32);
  always @(*) begin if(imm[15]) begin imm32[31:16]<=16'hFFFF; imm32[15:0]<=imm[15:0]; end else begin imm32[31:16]<=16'h0000; imm32[15:0]<=imm[15:0]; end end
endmodule

module mux_2x1_32b(input [31:0] in0,in1,input sel,output reg [31:0] out);
  always @(*) out <= sel? in1: in0; endmodule

module alu(input [31:0] aluIn1, aluIn2, input [3:0] aluControl, output reg [31:0] aluOut);
  always @(*) begin if(aluControl==3'b010) aluOut<=aluIn1+aluIn2; else if(aluControl==3'b110) aluOut<=aluIn1-aluIn2; else aluOut<=32'bx; end
endmodule

module data_mem(input clk, memWrite, memRead, input [31:0] addr, memIn, output reg [31:0] memOut);
  reg [31:0] memory [0:63]; initial begin memory[0]=32'd16817; memory[1]=32'd16801; memory[2]=32'd16; memory[3]=32'hDEAD_BEEF; memory[4]=32'h4242_4242; end
  always @(*) if(memRead) memOut <= memory[addr[31:2]]; else memOut<=32'bx;
  always @(negedge clk) if(memWrite) memory[addr[31:2]] <= memIn; 
endmodule

module mux_2x1_5b(input [4:0] in0,in1,input sel,output reg [4:0] out); always @(*) out <= sel? in1: in0; endmodule

module if_id(input clk, stall, input [31:0] inst, output reg [31:0] inst_d); always @(posedge clk) if(!stall) inst_d <= inst; endmodule

module id_ex(input clk,input regWrite, memToReg, memWrite, aluSrc, regDst, memRead,input [31:0] regOut1, regOut2, imm32,input [4:0] rt, rd,input [3:0] aluControl,input [4:0] rs,
             output reg regWrite_x, memToReg_x, memWrite_x, aluSrc_x, regDst_x, memRead_x,output reg [31:0] regOut1_x, regOut2_x, imm32_x,output reg [4:0] rt_x, rd_x,output reg [3:0] aluControl_x,output reg [4:0] rs_x);
  always @(posedge clk) begin regWrite_x<=regWrite; memToReg_x<=memToReg; memWrite_x<=memWrite; aluSrc_x<=aluSrc; regDst_x<=regDst; memRead_x<=memRead; regOut1_x<=regOut1; regOut2_x<=regOut2; imm32_x<=imm32; rt_x<=rt; rd_x<=rd; rs_x<=rs; aluControl_x<=aluControl; end
endmodule

module ex_mem(input clk, regWrite_x, memToReg_x, memWrite_x, memRead_x,input [31:0] aluOut, regOut2_x,input [4:0] writeAddr,
              output reg regWrite_m, memToReg_m, memWrite_m, memRead_m,output reg [31:0] aluOut_m, regOut2_m,output reg [4:0] writeAddr_m);
  always @(posedge clk) begin regWrite_m<=regWrite_x; memToReg_m<=memToReg_x; memWrite_m<=memWrite_x; memRead_m<=memRead_x; aluOut_m<=aluOut; regOut2_m<=regOut2_x; writeAddr_m<=writeAddr; end
endmodule

module mem_wb(input clk, regWrite_m, memToReg_m,input [31:0] aluOut_m, memOut,input [4:0] writeAddr_m,
              output reg regWrite_b, memToReg_b,output reg [31:0] aluOut_b, memOut_b,output reg [4:0] writeAddr_b);
  always @(posedge clk) begin regWrite_b<=regWrite_m; memToReg_b<=memToReg_m; aluOut_b<=aluOut_m; memOut_b<=memOut; writeAddr_b<=writeAddr_m; end
endmodule

module forward_reg(input [4:0] writeAddr_m, writeAddr_b, rs_x, rt_x,input regWrite_m, regWrite_b, output reg [1:0] forwardA, forwardB);
  always @(*) begin
    if (regWrite_m && (writeAddr_m!=5'd0) && (writeAddr_m==rs_x)) forwardA=2'b10; else if (regWrite_b && (writeAddr_b!=5'd0) && (writeAddr_b==rs_x)) forwardA=2'b01; else forwardA=2'b00;
    if (regWrite_m && (writeAddr_m!=5'd0) && (writeAddr_m==rt_x)) forwardB=2'b10; else if (regWrite_b && (writeAddr_b!=5'd0) && (writeAddr_b==rt_x)) forwardB=2'b01; else forwardB=2'b00;
  end
endmodule

module mux_3x1_32b(input [31:0] in0,in1,in2,input [1:0] sel,output reg [31:0] out);
  always @(*) case(sel) 2'b00: out=in0; 2'b01: out=in1; 2'b10: out=in2; default: out=32'b0; endcase
endmodule

module hazard_reg(input [4:0] rt_d, rt_x, rs_d,input memRead_x, output reg stall);
  initial stall=0; always @(*) if (memRead_x && ((rt_x==rs_d)||(rt_x==rt_d))) stall=1; else stall=0; 
endmodule
