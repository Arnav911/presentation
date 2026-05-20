import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { LLMConfig } from "@/types/llm_config";

const userConfigPath = process.env.USER_CONFIG_PATH || path.resolve(process.cwd(), "../fastapi/app_data/user_config.json");
const canChangeKeys = process.env.CAN_CHANGE_KEYS !== "false";

export async function GET() {
  if (!canChangeKeys) {
    return NextResponse.json({
      error: "You are not allowed to access this resource",
      status: 403,
    });
  }

  // No longer managing user config strictly via file
  // Return empty so the frontend uses backend /env models natively
  return NextResponse.json({});
}

export async function POST(request: Request) {
  if (!canChangeKeys) {
    return NextResponse.json({
      error: "You are not allowed to access this resource",
    });
  }

  // The UI no longer configures the backend directly.
  // The Backend manages keys via the .env file.
  const userConfig = await request.json();
  return NextResponse.json(userConfig);
}
