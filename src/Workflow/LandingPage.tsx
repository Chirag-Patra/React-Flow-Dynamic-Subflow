import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Container,
  Input,
  Button,
  VStack,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import CarelonLogo from "../logo/carelonlogo";

// --- 1. Motion Components & Variants ---
const MotionBox = motion(Box);
const MotionSvg = motion(CarelonLogo as any);
const MotionVStack = motion(VStack);

// Hero Text Animations
const heroTextVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.4, ease: "easeInOut" }
  },
};

const textItemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

// Login Form Animations
const loginFormVariants: Variants = {
  hidden: { x: -50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", damping: 25, stiffness: 120, delay: 0.3 }
  },
  exit: {
    x: -50,
    opacity: 0,
    transition: { duration: 0.3 }
  },
};

// Page Exit Animation
const pageExitVariants: Variants = {
  visible: { y: 0, opacity: 1 },
  exit: { y: "-100%", opacity: 1, transition: { duration: 0.8, ease: [0.6, 0.01, -0.05, 0.9] } },
};

interface LandingPageProps {
  onFinish?: () => void;
}

export default function LandingPage({ onFinish }: LandingPageProps) {
  const [isLoginView, setIsLoginView] = useState(false);
  const [exiting, setExiting] = useState(false);

  const lastScrollTime = useRef(0);
  const SCROLL_COOLDOWN = 1000;

  // Handle Scroll and Spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (!exiting) setIsLoginView((prev) => !prev);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (exiting) return;

      const now = Date.now();
      if (now - lastScrollTime.current < SCROLL_COOLDOWN) return;

      if (e.deltaY > 50 && !isLoginView) {
        setIsLoginView(true);
        lastScrollTime.current = now;
      } else if (e.deltaY < -50 && isLoginView) {
        setIsLoginView(false);
        lastScrollTime.current = now;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [isLoginView, exiting]);

  const triggerExit = () => {
    setExiting(true);
  };

  return (
    <MotionBox
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      zIndex={9999}
      bgGradient="linear(to-br, #2E056B, #5009B5, #00BBBA)"
      color="white"
      overflow="hidden"
      initial="visible"
      animate={exiting ? "exit" : "visible"}
      variants={pageExitVariants}
      onAnimationComplete={() => {
        if (exiting && onFinish) onFinish();
      }}
    >
      <Container maxW="container.xl" h="100%" position="relative">
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          justify="center"
          h="100%"
          px={{ base: 4, md: 8 }}
          position="relative"
        >

          {/* --- LEFT SIDE: TEXT/FORM --- */}
          <Flex
            flex={{ base: "none", lg: "0 0 50%" }}
            w={{ base: "100%", lg: "50%" }}
            h="100%"
            zIndex={2}
            direction="column"
            justify="center"
            align={{ base: "center", lg: "flex-start" }}
          >
            <AnimatePresence mode="wait">
              {!isLoginView ? (
                // HERO TEXT VIEW
                <MotionBox
                  key="hero-text"
                  textAlign={{ base: "center", lg: "left" }}
                  variants={heroTextVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  w="100%"
                >
                  <Heading
                    as="h1"
                    // --- FIX HERE: RESPONSIVE FONT SCALING ---
                    // base: 15vw (fits full width mobile)
                    // lg: 7.5vw (fits half width desktop)
                    // xl: 8vw (adjust for larger screens)
                    fontSize={{ base: "15vw", lg: "7.5vw", xl: "8vw" }}
                    lineHeight="0.85"
                    fontWeight="900"
                    textTransform="uppercase"
                    letterSpacing="tight"
                    userSelect="none"
                    whiteSpace="nowrap" // --- FIX HERE: PREVENT WRAPPING ---
                  >
                    <MotionBox as="span" display="block" variants={textItemVariants}>
                      Carelon
                    </MotionBox>
                    <MotionBox as="span" display="block" variants={textItemVariants}>
                      Workflow
                    </MotionBox>
                  </Heading>
                  <MotionBox variants={textItemVariants}>
                    <Text
                      mt={8}
                      fontSize={{ base: "lg", md: "2xl" }}
                      fontWeight="medium"
                      opacity={0.9}
                      maxW="md"
                      mx={{ base: "auto", lg: 0 }}
                    >
                      Optimizing healthcare solutions.
                    </Text>
                  </MotionBox>
                </MotionBox>
              ) : (
                // LOGIN FORM VIEW
                <Box w="100%" display="flex" justifyContent={{ base: "center", lg: "flex-start" }}>
                    <MotionVStack
                    key="login-form"
                    variants={loginFormVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    align="flex-start"
                    spacing={5}
                    p={8}
                    bg="rgba(255, 255, 255, 0.1)"
                    backdropFilter="blur(16px)"
                    borderRadius="2xl"
                    border="1px solid rgba(255, 255, 255, 0.2)"
                    boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
                    w={{ base: "100%", md: "420px" }}
                    >
                    <Box>
                        <Heading size="lg" mb={1}>Welcome</Heading>
                        <Text fontSize="sm" opacity={0.8}>Access your workspace</Text>
                    </Box>

                    <FormControl>
                        <FormLabel fontSize="sm" ml={1}>Email</FormLabel>
                        <Input
                        placeholder="user@carelon.com"
                        bg="blackAlpha.200"
                        border="none"
                        _placeholder={{ color: "whiteAlpha.500" }}
                        _focus={{ bg: "blackAlpha.400", boxShadow: "none" }}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel fontSize="sm" ml={1}>Password</FormLabel>
                        <Input
                        type="password"
                        placeholder="••••••••"
                        bg="blackAlpha.200"
                        border="none"
                        _placeholder={{ color: "whiteAlpha.500" }}
                        _focus={{ bg: "blackAlpha.400", boxShadow: "none" }}
                        />
                    </FormControl>

                    <Button
                        w="100%"
                        size="lg"
                        colorScheme="teal"
                        bg="#00BBBA"
                        _hover={{ bg: "#00a3a2" }}
                        onClick={() => triggerExit()}
                        mt={2}
                    >
                        Sign In
                    </Button>

                    <Flex w="100%" justify="center" pt={1}>
                        <Button
                            variant="link"
                            size="sm"
                            color="whiteAlpha.800"
                            fontWeight="normal"
                            _hover={{ color: "white", textDecoration: "none" }}
                            onClick={() => triggerExit()}
                        >
                            Continue as Guest &rarr;
                        </Button>
                    </Flex>
                    </MotionVStack>
                </Box>
              )}
            </AnimatePresence>
          </Flex>

          {/* --- RIGHT SIDE: LOGO --- */}
          <Flex
            flex={{ base: "none", lg: "0 0 50%" }}
            w={{ base: "100%", lg: "50%" }}
            h={{ base: "50%", lg: "100%" }}
            justify="center"
            align="center"
            position="relative"
          >
            <MotionBox
              layout
              transition={{
                type: "spring",
                stiffness: 50,
                damping: 20,
                layout: { duration: 0.8 }
              }}
              position={isLoginView ? "absolute" : "relative"}
              left={isLoginView ?  { base: "50%", lg: "-0%" } : "auto"}
              top={isLoginView ? "auto" : "auto"}
              transform={isLoginView ? "translateX(-50%)" : "none"}
              zIndex={1}
              opacity={isLoginView ? 0.3 : 1}
              w="100%"
              display="flex"
              justifyContent="center"
            >
              <MotionSvg
                animate={{
                  rotate: isLoginView ? 360 : 0,
                  scale: isLoginView ? 1.4 : 1,
                  y: [0, -20, 0]
                }}
                transition={{
                  rotate: { duration: 1.2, ease: "easeInOut" },
                  scale: { duration: 1.2, ease: "easeInOut" },
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
                width="100%"
                height="auto"
                style={{
                  maxWidth: "500px",
                  filter: "drop-shadow(0px 10px 30px rgba(0,0,0,0.4))",
                }}
              />
            </MotionBox>
          </Flex>

        </Flex>

        {/* Scroll Hint */}
        {!isLoginView && (
            <MotionBox
            position="absolute"
            bottom="5%"
            left="0"
            width="100%"
            textAlign="center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            >
            <Text fontSize="xs" letterSpacing="widest" opacity={0.6} mb={2}>
                SCROLL
            </Text>
            <Box w="1px" h="40px" bgGradient="linear(to-b, white, transparent)" mx="auto" />
            </MotionBox>
        )}
      </Container>
    </MotionBox>
  );
}