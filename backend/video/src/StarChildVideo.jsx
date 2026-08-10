import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const COLORS = {
  midnight: "#171432",
  cream: "#FFF8EA",
  gold: "#E9B86E",
  lavender: "#BBA9D8",
};

const INTRO_SECONDS = 6;
const OUTRO_SECONDS = 6;

const STATIC_STARS = [
  [8, 10, 8],
  [22, 18, 5],
  [78, 12, 7],
  [88, 25, 4],
  [12, 62, 6],
  [91, 70, 8],
  [30, 84, 4],
  [70, 88, 5],
];

const FLOATING_SPARKLES = [
  { left: 8, top: 82, size: 7, speed: 0.72, delay: 0 },
  { left: 20, top: 68, size: 5, speed: 0.56, delay: 28 },
  { left: 78, top: 88, size: 6, speed: 0.64, delay: 55 },
  { left: 91, top: 72, size: 4, speed: 0.48, delay: 82 },
  { left: 48, top: 94, size: 5, speed: 0.6, delay: 105 },
];

const StarField = ({ soft = false }) => {
  const frame = useCurrentFrame();

  return (
    <>
      {STATIC_STARS.map(([left, top, size], index) => {
        const pulse =
          0.48 +
          Math.sin(frame / 18 + index * 1.8) * 0.22;

        const scale =
          0.88 +
          Math.sin(frame / 24 + index * 2.1) * 0.13;

        return (
          <div
            key={`${left}-${top}`}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: COLORS.gold,
              boxShadow: `0 0 ${size * 4}px ${COLORS.gold}`,
              opacity: soft ? pulse * 0.45 : pulse,
              transform: `scale(${scale})`,
            }}
          />
        );
      })}
    </>
  );
};

const FloatingSparkles = ({ intensity = 1 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {FLOATING_SPARKLES.map(
        ({ left, top, size, speed, delay }, index) => {
          const safeDuration = Math.max(
            durationInFrames,
            1
          );

          const localFrame =
            (frame + delay) % safeDuration;

          const progress =
            localFrame / safeDuration;

          const rise = progress * 460 * speed;

          const sway =
            Math.sin(frame / 25 + index * 1.7) * 25;

          const fadeIn = interpolate(
            progress,
            [0, 0.15],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );

          const fadeOut = interpolate(
            progress,
            [0.72, 1],
            [1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }
          );

          return (
            <div
              key={`${left}-${top}-${index}`}
              style={{
                position: "absolute",
                left: `calc(${left}% + ${sway}px)`,
                top: `calc(${top}% - ${rise}px)`,
                width: size,
                height: size,
                borderRadius: "50%",
                background: COLORS.gold,
                boxShadow:
                  `0 0 ${size * 4}px ${COLORS.gold}, ` +
                  `0 0 ${size * 7}px rgba(233,184,110,0.4)`,
                opacity:
                  fadeIn *
                  fadeOut *
                  0.7 *
                  intensity,
              }}
            />
          );
        }
      )}
    </AbsoluteFill>
  );
};

const GuardianGlow = ({
  symbol = "✦",
  size = 110,
  top,
  bottom,
  right,
  left,
}) => {
  const frame = useCurrentFrame();

  const breath =
    1 + Math.sin(frame / 28) * 0.075;

  const glow =
    22 + Math.sin(frame / 24) * 9;

  const rotation =
    Math.sin(frame / 45) * 4;

  return (
    <div
      style={{
        position: "absolute",
        top,
        bottom,
        right,
        left,
        fontSize: size,
        color: COLORS.gold,
        lineHeight: 1,
        transform:
          `translateX(${left === "50%" ? "-50%" : "0"}) ` +
          `scale(${breath}) rotate(${rotation}deg)`,
        textShadow:
          `0 0 ${glow}px ${COLORS.gold}, ` +
          `0 0 ${glow * 2}px rgba(233,184,110,0.48)`,
      }}
    >
      {symbol}
    </div>
  );
};

const Intro = ({
  childName,
  guardianStar,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } =
    useVideoConfig();

  const opacity = interpolate(
    frame,
    [
      0,
      fps,
      Math.max(durationInFrames - fps, fps),
      durationInFrames,
    ],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const scale = spring({
    frame,
    fps,
    config: {
      damping: 16,
      stiffness: 70,
    },
  });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.midnight,
        alignItems: "center",
        justifyContent: "center",
        color: COLORS.cream,
        opacity,
        overflow: "hidden",
      }}
    >
      <StarField />
      <FloatingSparkles intensity={0.8} />

      <GuardianGlow
        symbol="✦"
        size={124}
        top="17%"
        left="50%"
      />

      <div
        style={{
          transform:
            `scale(${0.85 + scale * 0.15})`,
          textAlign: "center",
          padding: 90,
          marginTop: 130,
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.2,
            textShadow:
              "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          Merhaba {childName}...
        </div>

        <div
          style={{
            marginTop: 42,
            fontSize: 46,
            color: COLORS.lavender,
            lineHeight: 1.45,
          }}
        >
          Bu akşam seni yeni bir yıldız
          yolculuğu bekliyor...
        </div>

        <div
          style={{
            marginTop: 44,
            fontSize: 32,
            color: COLORS.gold,
          }}
        >
          Dost yıldızın {guardianStar} yanında.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const StoryPage = ({
  page,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } =
    useVideoConfig();

  const fadeFrames = Math.min(
    fps * 0.8,
    Math.max(durationInFrames * 0.12, 1)
  );

  const opacity = interpolate(
    frame,
    [
      0,
      fadeFrames,
      Math.max(
        durationInFrames - fadeFrames,
        fadeFrames
      ),
      durationInFrames,
    ],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const zoom = interpolate(
    frame,
    [0, durationInFrames],
    [1.02, 1.1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const horizontalMove =
    index % 2 === 0
      ? interpolate(
          frame,
          [0, durationInFrames],
          [-12, 12]
        )
      : interpolate(
          frame,
          [0, durationInFrames],
          [12, -12]
        );

  const textRise = interpolate(
    frame,
    [0, fadeFrames],
    [35, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill
      style={{
        background: COLORS.midnight,
        opacity,
        overflow: "hidden",
      }}
    >
      <Img
        src={staticFile(page.image)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform:
            `scale(${zoom}) ` +
            `translateX(${horizontalMove}px)`,
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, " +
            "rgba(23,20,50,0.94) 0%, " +
            "rgba(23,20,50,0.28) 54%, " +
            "rgba(23,20,50,0.08) 100%)",
        }}
      />

      <StarField soft />
      <FloatingSparkles intensity={0.62} />

      <GuardianGlow
        symbol="✦"
        size={72}
        top={72}
        right={72}
      />

      <div
        style={{
          position: "absolute",
          left: 62,
          right: 62,
          bottom: 82,
          textAlign: "center",
          color: COLORS.cream,
          transform:
            `translateY(${textRise}px)`,
        }}
      >
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            marginBottom: 25,
            textShadow:
              "0 4px 20px rgba(0,0,0,0.65)",
          }}
        >
          {page.title}
        </div>

        <div
          style={{
            fontSize: 37,
            lineHeight: 1.45,
            fontWeight: 500,
            textShadow:
              "0 3px 18px rgba(0,0,0,0.75)",
          }}
        >
          {page.text}
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 23,
            color: COLORS.gold,
          }}
        >
          {index + 1}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Outro = ({
  childName,
  guardianStar,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } =
    useVideoConfig();

  const opacity = interpolate(
    frame,
    [
      0,
      fps,
      Math.max(durationInFrames - fps, fps),
      durationInFrames,
    ],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill
      style={{
        background: COLORS.midnight,
        alignItems: "center",
        justifyContent: "center",
        color: COLORS.cream,
        opacity,
        overflow: "hidden",
      }}
    >
      <StarField />
      <FloatingSparkles intensity={0.7} />

      <GuardianGlow
        symbol="☾"
        size={135}
        top="13%"
        left="50%"
      />

      <div
        style={{
          textAlign: "center",
          padding: 90,
          marginTop: 130,
        }}
      >
        <div
          style={{
            fontSize: 74,
            fontWeight: 700,
          }}
        >
          İyi geceler {childName}...
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 43,
            lineHeight: 1.5,
            color: COLORS.lavender,
          }}
        >
          Yarın yeni bir yıldız yolculuğunda
          yeniden buluşacağız...
        </div>

        <div
          style={{
            marginTop: 42,
            fontSize: 30,
            color: COLORS.gold,
          }}
        >
          {guardianStar} seni bekliyor.
        </div>

        <div
          style={{
            marginTop: 80,
            fontSize: 26,
            letterSpacing: 5,
          }}
        >
          STAR CHILD TALES
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const StarChildVideo = ({
  childName = "Mila",
  guardianStar = "Veyla",
  pages = [],
  audioFile = null,
  totalDurationSeconds = 92,
}) => {
  const { fps } = useVideoConfig();

  const introFrames =
    INTRO_SECONDS * fps;

  const outroFrames =
    OUTRO_SECONDS * fps;

  const totalFrames = Math.max(
    Math.round(totalDurationSeconds * fps),
    introFrames + outroFrames + pages.length
  );

  const availablePageFrames = Math.max(
    totalFrames - introFrames - outroFrames,
    pages.length
  );

  const pageFrames = Math.max(
    Math.floor(
      availablePageFrames /
        Math.max(pages.length, 1)
    ),
    1
  );

  const usedPageFrames =
    pageFrames * pages.length;

  const outroStart =
    introFrames + usedPageFrames;

  return (
    <AbsoluteFill
      style={{
        background: COLORS.midnight,
      }}
    >
      {audioFile ? (
        <Audio
          src={staticFile(audioFile)}
          volume={1}
        />
      ) : null}

      <Sequence
        from={0}
        durationInFrames={introFrames}
      >
        <Intro
          childName={childName}
          guardianStar={guardianStar}
        />
      </Sequence>

      {pages.map((page, index) => (
        <Sequence
          key={`${page.title}-${index}`}
          from={
            introFrames +
            index * pageFrames
          }
          durationInFrames={pageFrames}
        >
          <StoryPage
            page={page}
            index={index}
          />
        </Sequence>
      ))}

      <Sequence
        from={outroStart}
        durationInFrames={Math.max(
          totalFrames - outroStart,
          1
        )}
      >
        <Outro
          childName={childName}
          guardianStar={guardianStar}
        />
      </Sequence>
    </AbsoluteFill>
  );
};