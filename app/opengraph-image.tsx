import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt="OTTOKO — Everything about your car. One garage.";
export const size={width:1200,height:630};
export const contentType="image/png";
export const runtime="nodejs";

export default async function OpenGraphImage(){
  const [heroFile,fontFile]=await Promise.all([
    readFile(join(process.cwd(),"public/garagebook-hero-white-gt3rs.png")),
    readFile(join(process.cwd(),"public/fonts/manrope-800.ttf")),
  ]);
  const hero=Uint8Array.from(heroFile).buffer;
  const font=Uint8Array.from(fontFile).buffer;

  return new ImageResponse(
    <div style={{position:"relative",display:"flex",width:"100%",height:"100%",overflow:"hidden",background:"#111516",fontFamily:"OTTOKO Manrope"}}>
      {/* @ts-expect-error Satori supports ArrayBuffer image sources. */}
      <img alt="" src={hero} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
      <div style={{position:"absolute",inset:0,display:"flex",background:"linear-gradient(90deg,rgba(5,7,8,.96) 0%,rgba(5,7,8,.78) 42%,rgba(5,7,8,.08) 72%)"}}/>

      <div style={{position:"relative",display:"flex",width:"640px",height:"100%",flexDirection:"column",justifyContent:"center",padding:"58px 0 58px 70px"}}>
        <div style={{display:"flex",width:"auto",alignSelf:"flex-start",overflow:"hidden",transform:"skewX(-12deg)",fontSize:27,fontStyle:"italic",letterSpacing:"-1.2px",lineHeight:1}}>
          <div style={{display:"flex",background:"#fffdf9",color:"#191c1d",padding:"14px 10px 14px 18px"}}><span style={{transform:"skewX(12deg)"}}>OTTO</span></div>
          <div style={{display:"flex",background:"#191c1d",color:"#f3bd3d",padding:"14px 18px 14px 10px"}}><span style={{transform:"skewX(12deg)"}}>KO</span></div>
        </div>

        <div style={{display:"flex",flexDirection:"column",marginTop:28,fontSize:74,letterSpacing:"-3px",lineHeight:.93}}>
          <span style={{color:"#fffdf9"}}>Everything about</span>
          <span style={{color:"#f3bd3d"}}>your car.</span>
          <span style={{color:"#f3bd3d"}}>One garage.</span>
        </div>
        <p style={{display:"flex",width:"520px",margin:"28px 0 0",color:"#e6e3dc",fontFamily:"Arial",fontSize:22,lineHeight:1.45}}>
          Maintenance, repairs, symptoms, receipts, and history—together.
        </p>
      </div>

      <div style={{position:"absolute",right:34,bottom:28,display:"flex",alignItems:"center",gap:10,borderRadius:8,background:"rgba(25,28,29,.88)",padding:"10px 14px",color:"#fffdf9",fontFamily:"Arial",fontSize:16}}>
        Your complete vehicle history
      </div>
    </div>,
    { ...size,fonts:[{name:"OTTOKO Manrope",data:font,weight:800,style:"normal"}] },
  );
}
