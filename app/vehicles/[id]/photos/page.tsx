import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Camera, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DocumentDeleteButton } from "@/components/document-delete-button";
import { DocumentUpload } from "@/components/document-upload";
import { getVehicle,getVehiclePhotos } from "@/lib/data/garage";
import { formatDate } from "@/lib/format";

export default async function VehiclePhotosPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const [vehicle,photos]=await Promise.all([getVehicle(id),getVehiclePhotos(id,100)]);
  if(!vehicle)notFound();

  return <AppShell vehicleId={id}>
    <div className="gallery-header">
      <div><Link className="gallery-back" href={`/vehicles/${id}`}><ArrowLeft size={16}/>Vehicle record</Link><h1>{vehicle.year} {vehicle.make} {vehicle.model}</h1><p>Your private vehicle photo gallery. The newest upload appears on the dashboard.</p></div>
      <span>{photos.length} photo{photos.length===1?"":"s"}</span>
    </div>

    <section className="gallery-layout" aria-labelledby="vehicle-gallery-heading">
      <aside className="gallery-upload-panel">
        <Camera size={25}/><h2>Add to this gallery</h2><p>Upload exterior, interior, modification, detail, or condition photos. JPEG, PNG, and WebP files up to 10 MB are supported.</p>
        <DocumentUpload vehicleId={id} defaultType="photo" lockType photoOnly buttonLabel="Upload vehicle photo"/>
      </aside>

      <div>
        <div className="gallery-section-heading"><h2 id="vehicle-gallery-heading">Vehicle photos</h2><p>Open any image to view its secure full-size version.</p></div>
        {photos.length?<div className="vehicle-gallery-grid">{photos.map((photo,index)=><figure className={index===0?"gallery-featured":""} key={photo.id}>
          <Link aria-label={`View ${photo.file_name} full size`} href={`/documents/${photo.id}`} target="_blank"><Image alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} — ${photo.file_name}`} fill priority={index===0} sizes={index===0?"(max-width: 900px) 100vw, 48vw":"(max-width: 640px) 100vw, 28vw"} src={photo.url} unoptimized/></Link>
          <figcaption><div><strong>{index===0?"Latest photo":photo.file_name}</strong><span>Uploaded {formatDate(photo.uploaded_at)}</span></div><div className="gallery-photo-actions"><Link aria-label={`Open ${photo.file_name} full size`} href={`/documents/${photo.id}`} target="_blank"><ExternalLink size={16}/></Link><DocumentDeleteButton compact documentId={photo.id} vehicleId={id} fileName={photo.file_name}/></div></figcaption>
        </figure>)}</div>:<div className="gallery-empty"><Camera size={32}/><h3>Your gallery is ready</h3><p>Upload the first photo to personalize this vehicle’s dashboard and start its visual history.</p></div>}
      </div>
    </section>
  </AppShell>;
}
