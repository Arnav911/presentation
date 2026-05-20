import React from "react";
import * as z from "zod";
import { ImageSchema } from "@/presentation-templates/defaultSchemes";

export const layoutId = "pitch-our-team";
export const layoutName = "Pitch Our Team";
export const layoutDescription =
  "Beige team slide with three columns, each showing a name, photo placeholder, and short bio.";

const TeamMemberSchema = z.object({
  name: z.string().default("Full Name"),
  photo: ImageSchema.default({__image_url__: "",
    __image_prompt__: "Professional headshot portrait, editorial photography style",
  }).meta({ description: "Headshot photo for this team member" }),
  bio: z.string().default("Highlight bits about each team member that are relevant to this specific pitch and project."),
});

const schema = z.object({
  agencyLabel: z.string().default("Agency Name × Partner Name").meta({ description: "Header label on the right" }),
  phase: z.string().default("Phase X").meta({ description: "Phase label on the far right" }),
  members: z
    .array(TeamMemberSchema)
    .default([
      {
        name: "Full Name",
        __image_url__: "",
        photo: { __image_prompt__: "Professional headshot portrait" },
        bio: "Highlight bits about each team member that are relevant to this specific pitch and project.",
      },
      {
        name: "Full Name",
        __image_url__: "",
        photo: { __image_prompt__: "Professional headshot portrait, candid style" },
        bio: "Role, location, past ventures, and more — anything that will let this client know why the team is so qualified.",
      },
      {
        name: "Full Name",
        __image_url__: "",
        photo: { __image_prompt__: "Professional headshot portrait, studio lighting" },
        bio: "If sharing async, you might want to link to profiles on your team's website, or on LinkedIn.",
      },
    ])
    .meta({ description: "List of up to 3 team members" }),
});

export const Schema = schema;
export type PitchOurTeamData = z.infer<typeof schema>;

interface Props {
  data: Partial<PitchOurTeamData>;
}

const PitchOurTeamSlide: React.FC<Props> = ({ data }) => {
  const { agencyLabel, phase, members } = data;

  const resolvedMembers = members ?? [
    { name: "Full Name", bio: "Highlight bits about each team member relevant to this pitch." },
    { name: "Full Name", bio: "Role, location, past ventures — anything that qualifies the team." },
    { name: "Full Name", bio: "Link to profiles on your website or LinkedIn if sharing async." },
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Libre+Franklin:wght@400;600&family=Space+Mono&display=swap"
        rel="stylesheet"
      />
      <div
        className="w-full max-w-[1280px] aspect-video relative overflow-hidden flex flex-col"
        style={{ backgroundColor: "#E4DDD0" }}
      >
        {/* ── Top bar ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 48px",
          }}
        >
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(28px, 4vw, 52px)",
              textTransform: "uppercase",
              color: "#111111",
              margin: 0,
            }}
          >
            Our Team
          </h2>
          <div
            style={{
              display: "flex",
              gap: 60,
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 12,
              color: "rgba(0,0,0,0.4)",
            }}
          >
            <span>{agencyLabel ?? "Agency Name × Partner Name"}</span>
            <span>{phase ?? "Phase X"}</span>
          </div>
        </div>

        {/* ── Members grid ── */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 28,
            padding: "8px 48px 32px",
          }}
        >
          {resolvedMembers.map((member, i) => {
            const imgUrl =
              member.photo && (member.photo as any).__image_url__
                ? (member.photo as any).__image_url__
                : null;

            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Name */}
                <span
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: "clamp(18px, 2.5vw, 30px)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "#111111",
                  }}
                >
                  {member.name}
                </span>

                {/* Photo */}
                <div
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: imgUrl ? `url('${imgUrl}') center/cover no-repeat` : "#C8C1B3",
                    minHeight: 180,
                    display: imgUrl ? "block" : "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!imgUrl && (
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'Libre Franklin', sans-serif",
                        fontSize: 20,
                        fontWeight: 600,
                        color: "rgba(0,0,0,0.35)",
                      }}
                    >
                      {member.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                </div>

                {/* Bio */}
                <p
                  style={{
                    fontFamily: "'Libre Franklin', sans-serif",
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: "#555555",
                    margin: 0,
                  }}
                >
                  {member.bio}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default PitchOurTeamSlide;
