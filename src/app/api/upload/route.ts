import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";
import { parse } from "path";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const password = formData.get("password") as string | null;
        const expiryRaw = formData.get("expiry") as string | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }
        if (!expiryRaw) {
            return NextResponse.json({ error: "No expiry selected" }, { status: 400 });
        }
        if (!password) {
            return NextResponse.json({ error: "No password selected" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileId = uuidv4();

        const { data, error: uploadError } = await supabase.storage
            .from("dropvault")
            .upload(`${fileId}`, buffer, {
                contentType: file.type || "",
            });

        if (uploadError) {
            console.error("Supabase upload error:", uploadError);
            return NextResponse.json({ error: uploadError.message || "Error uploading file" }, { status: 500 });
        }

        const publicUrl = supabase.storage
            .from("dropvault")
            .getPublicUrl(`${fileId}`).data.publicUrl;

        // Calculate expiry time
        const expiryTime = new Date();
        switch (expiryRaw) {
            case '15 mins':
                expiryTime.setMinutes(expiryTime.getMinutes() + 15);
                break;
            case '30 mins':
                expiryTime.setMinutes(expiryTime.getMinutes() + 30);
                break;
            case '1 hour':
                expiryTime.setHours(expiryTime.getHours() + 1);
                break;
            case '6 hours':
                expiryTime.setHours(expiryTime.getHours() + 6);
                break;
            case '12 hours':
                expiryTime.setHours(expiryTime.getHours() + 12);
                break;
            case '24 hours':
                expiryTime.setHours(expiryTime.getHours() + 24);
                break;
            default:
                return NextResponse.json({ error: "Invalid expiry selected" }, { status: 400 });
        }
    
        const { error: insertError } = await supabase
            .from("Files")
            .insert(
                {
                    fileID: fileId,
                    fileURL: publicUrl,
                    password: password,
                    expiry: expiryTime.toISOString(),
                    used: false,
                    fileSize:file.size
                },
            );
        if (insertError) {
            console.error("Supabase insert error:", insertError);
            return NextResponse.json({ error: insertError.message || "Error inserting file" }, { status: 500 });
        }
        return NextResponse.json({
            success: true,
            fileId: fileId,
            url: publicUrl,
        });
    } catch (err: any) {
        console.error("Route handler error:", err);
        return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
}