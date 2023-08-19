const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/XXX/YYY/ZZZZZ";

async function sendSlackRequest({ text, blocks }) {
  const postToSlack = await fetch(SLACK_WEBHOOK_URL, {
    body: JSON.stringify({ text, blocks }),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const body = await request.json();
      const slackPayload = handleExpoStatus(body);
      await sendSlackRequest(slackPayload);
      return new Response("ok");
    } else {
      return new Response("ok");
    }
  },
};

function handleExpoStatus(body) {
  if (body.platform === "ios" && body.status === "finished") {
    const url = `itms-services://?action=download-manifest;url=https://exp.host/--/api/v2/projects/${body.appId}/builds/${body.id}/manifest.plist`;

    return {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":apple-logo: Build completed successfully for iOS :ship_it_parrot:",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Build Profile*: ${body.metadata.buildProfile}\n*Version:* ${body.metadata.appVersion}\n*Build*: ${body.metadata.appBuildVersion}`,
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Download IPA",
              },
              url: body.artifacts.buildUrl,
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Open Build Details Page",
              },
              url: body.buildDetailsPageUrl,
            },
          ],
        },
        {
          type: "image",
          image_url: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
            url
          )}&size=250x250&qzone=2`,
          alt_text: "qr",
        },
      ],
    };
  }

  if (body.platform === "android" && body.status === "finished") {
    return {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":android-logo: Build completed successfully for Android :ship_it_parrot:",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Build Profile*: ${body.metadata.buildProfile}\n*Version:* ${body.metadata.appVersion}\n*Build*: ${body.metadata.appBuildVersion}`,
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Download APK",
              },
              url: body.artifacts.buildUrl,
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Open Build Details Page",
              },
              url: body.buildDetailsPageUrl,
            },
          ],
        },
        {
          type: "image",
          image_url: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
            body.artifacts.buildUrl
          )}&size=250x250&qzone=2`,
          alt_text: "qr",
        },
      ],
    };
  }

  if (body.platform === "ios" && body.status === "errored") {
    return {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":apple-logo: Build failed for iOS :sob:",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Build Profile*: ${body.metadata.buildProfile}\n*Version:* ${body.metadata.appVersion}\n*Build*: ${body.metadata.appBuildVersion}`,
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Open Build Details Page",
              },
              url: body.buildDetailsPageUrl,
            },
          ],
        },
      ],
    };
  }

  if (body.platform === "android" && body.status === "errored") {
    return {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":android-logo: Build failed for Android :sob:",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Build Profile*: ${body.metadata.buildProfile}\n*Version:* ${body.metadata.appVersion}\n*Build*: N/A`,
            },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Open Build Details Page",
              },
              url: body.buildDetailsPageUrl,
            },
          ],
        },
      ],
    };
  }
}
