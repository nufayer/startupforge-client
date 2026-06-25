import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json({ message: "No image file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "ImgBB API key not configured" }, { status: 500 });
    }

    const imgBBForm = new FormData();
    imgBBForm.append("image", base64);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: imgBBForm,
    });

    const data = await res.json();
    if (!data.success) {
      return NextResponse.json({ message: data.error?.message || "ImgBB upload failed" }, { status: 500 });
    }

    return NextResponse.json({ url: data.data.url, delete_url: data.data.delete_url });
  } catch (e) {
    return NextResponse.json({ message: e?.message || "Upload failed" }, { status: 500 });
  }
}
