import { describe,expect,it } from "vitest";
import { getDocumentDeliveryUrl } from "../lib/domain/document-delivery";

describe("document delivery URLs",()=>{
  it("builds a stable authenticated route for inline vehicle photos",()=>{
    expect(getDocumentDeliveryUrl("photo-id",true)).toBe("/documents/photo-id?inline=1");
  });

  it("encodes document identifiers before placing them in a path",()=>{
    expect(getDocumentDeliveryUrl("photo/id")).toBe("/documents/photo%2Fid");
  });
});
