import { writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.formData();

    const file = data.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se envió archivo" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const extension = file.name.split(".").pop();

    const fileName = `${Date.now()}.${extension}`;

    const uploadPath = path.join(
      process.cwd(),
      "public",
      "categorias",
      fileName
    );

    await writeFile(uploadPath, buffer);

    return NextResponse.json({
      imageUrl: `/categorias/${fileName}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al subir imagen" },
      { status: 500 }
    );
  }
}