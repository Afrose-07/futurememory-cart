import { Client } from "@gradio/client";

async function testGradio() {
  console.log("Connecting to Hugging Face Free Space...");
  try {
    const client = await Client.connect("black-forest-labs/FLUX.1-schnell");
    console.log("Connected successfully to FLUX.1-schnell Space!");
    
    // View API endpoints
    const apiInfo = await client.view_api();
    console.log("API endpoints:", JSON.stringify(apiInfo, null, 2).slice(0, 300));
  } catch(e) {
    console.log("Connection notice:", e.message);
  }
}
testGradio();
