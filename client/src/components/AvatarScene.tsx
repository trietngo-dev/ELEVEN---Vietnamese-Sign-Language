import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useFBX,
  useAnimations,
  Center,
} from "@react-three/drei";
import * as THREE from "three";

// 1. Component Model: Quản lý toàn bộ kịch bản
const Model = ({ currentAction }: { currentAction: string }) => {
  const groupRef = useRef<THREE.Group>(null);

  // LOAD THỂ XÁC GỐC
  const botFBX = useFBX("/Y Bot.fbx");

  // LOAD TẤT CẢ KỊCH BẢN (Dựa theo chính xác tên file của bạn)
  const animIdle = useFBX("/Standing W_Briefcase Idle.fbx");
  const animWaving = useFBX("/Waving.fbx");
  const animTalking = useFBX("/Talking.fbx");
  const animTalking1 = useFBX("/Talking (1).fbx");
  const animClapping = useFBX("/Clapping.fbx");
  const animStandingClap = useFBX("/Standing Clap.fbx");
  const animThumbsUp = useFBX("/Standing Thumbs Up.fbx");
  const animVictory = useFBX("/Victory.fbx");
  const animVictoryIdle = useFBX("/Victory Idle.fbx");

  // Đổi tên và gom nhóm tự động để React Three Fiber hiểu được
  const animationsMap = [
    { name: "Idle", clip: animIdle.animations[0] },
    { name: "Waving", clip: animWaving.animations[0] },
    { name: "Talking", clip: animTalking.animations[0] },
    { name: "Talking_1", clip: animTalking1.animations[0] },
    { name: "Clapping", clip: animClapping.animations[0] },
    { name: "StandingClap", clip: animStandingClap.animations[0] },
    { name: "ThumbsUp", clip: animThumbsUp.animations[0] },
    { name: "Victory", clip: animVictory.animations[0] },
    { name: "VictoryIdle", clip: animVictoryIdle.animations[0] },
  ];

  // Lọc ra các clip hợp lệ và gán tên mới
  const allClips = animationsMap
    .filter((anim) => anim.clip !== undefined)
    .map((anim) => {
      anim.clip.name = anim.name;
      return anim.clip;
    });

  // Bơm toàn bộ Hồn vào Xác
  const { actions } = useAnimations(allClips, groupRef);

  useEffect(() => {
    // Chạy hành động theo state truyền vào
    const action = actions[currentAction];
    if (action) {
      action.reset().fadeIn(0.3).play();
    }

    // Mờ dần hành động cũ khi chuyển sang hành động mới
    return () => {
      if (action) action.fadeOut(0.3);
    };
  }, [currentAction, actions]);

  return (
    <group ref={groupRef}>
      {/* Không dùng position thủ công, chỉ scale to lên và để Center tự lo toan */}
      <primitive object={botFBX} scale={0.03} />
    </group>
  );
};

// 2. Component Giao diện
const AvatarScene: React.FC<{ autoGreeting?: boolean }> = ({
  autoGreeting = false,
}) => {
  const [animation, setAnimation] = useState(autoGreeting ? "Waving" : "Idle");
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (autoGreeting) {
      // Play waving for 3 seconds, then switch to Idle
      // The Waving animation is usually around 2-3 seconds long
      const timer = setTimeout(() => {
        setAnimation("Idle");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoGreeting]);

  // Danh sách các nút bấm để bạn test toàn bộ các hành động
  const actionList = [
    "Idle",
    "Waving",
    "Talking",
    "Talking_1",
    "Clapping",
    "StandingClap",
    "ThumbsUp",
    "Victory",
    "VictoryIdle",
  ];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "300px",
      }}
    >
      {/* Nút bật/tắt công cụ test */}
      <button
        onClick={() => setShowControls(!showControls)}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 20,
          width: "32px",
          height: "32px",
          background: "rgba(0,0,0,0.5)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
        }}
        title="Bật/Tắt công cụ test"
      >
        ⚙️
      </button>

      {/* BẢNG ĐIỀU KHIỂN - Sinh tự động theo danh sách */}
      {showControls && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 10,
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            maxWidth: "calc(100% - 50px)",
          }}
        >
          {actionList.map((act) => (
            <button
              key={act}
              onClick={() => setAnimation(act)}
              style={{
                padding: "8px 12px",
                background: animation === act ? "#FF5722" : "#2196F3", // Nút đang chọn sẽ có màu cam
                color: "white",
                cursor: "pointer",
                border: "none",
                borderRadius: "5px",
                fontWeight: "bold",
              }}
            >
              {act}
            </button>
          ))}
        </div>
      )}

      {/* SÂN KHẤU 3D */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "10px",
          backgroundColor: "#e0e0e0",
          overflow: "hidden",
        }}
      >
        <Canvas camera={{ position: [0, 0, 7], fov: 40 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />

          <Suspense fallback={null}>
            {/* Đưa trọng tâm gốc về giữa khung hình tuyệt đối theo cả 3 trục */}
            <Center>
              <Model currentAction={animation} />
            </Center>
          </Suspense>

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default AvatarScene;

// Tải trước toàn bộ FBX vào bộ nhớ đệm (RAM) để khi người dùng ấn nút, tốc độ mount 3D sẽ là ngay tức thì
useFBX.preload("/Y Bot.fbx");
useFBX.preload("/Standing W_Briefcase Idle.fbx");
useFBX.preload("/Waving.fbx");
useFBX.preload("/Talking.fbx");
useFBX.preload("/Talking (1).fbx");
useFBX.preload("/Clapping.fbx");
useFBX.preload("/Standing Clap.fbx");
useFBX.preload("/Standing Thumbs Up.fbx");
useFBX.preload("/Victory.fbx");
useFBX.preload("/Victory Idle.fbx");
