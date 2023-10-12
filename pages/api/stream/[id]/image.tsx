// @ts-nocheck
import { ImageResponse } from "@vercel/og";
import { NextApiHandler } from "next";

export const config = {
  runtime: "edge",
};

const handler: NextApiHandler = async (req) => {
  try {
    const { searchParams } = new URL(req.url!);
    const id = searchParams.get("id");
    const imageData = await fetch(new URL("./og_base.png", import.meta.url)).then((res) => res.arrayBuffer());
    if (!id) {
      return new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <img width="1200" height="650" src={imageData} />
          </div>
        ),
        {
          width: 1200,
          height: 650,
        }
      );
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <img width="1200" height="650" src={imageData} />

          <div
            style={{
              position: "absolute",
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              paddingLeft: "59px",
              zIndex: 10,
              color: "white",
              fontSize: 28,
            }}
          >
            Token Stream #{id}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 650,
      }
    );
  } catch (e) {
    console.log(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
};

export default handler;
