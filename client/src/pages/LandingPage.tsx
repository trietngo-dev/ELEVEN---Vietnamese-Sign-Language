import heroImg from "../assets/hero.png";
import { motion } from "framer-motion";
import { Bot, BookOpenCheck, Languages, Mic2 } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { viText } from "../locales/vi";
import { useNavigate } from "react-router-dom";

const featureIcons = [Bot, BookOpenCheck, Mic2] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

function LandingPage() {
  const { common, landing } = viText;
  const navigate = useNavigate();

  return (
    <>
      <section className="bg-[radial-gradient(circle_at_top_left,#f9fdf9_0%,#f3f6f4_46%,#f9faf9_100%)] py-14 md:py-[76px]">
        <div className="container grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] xl:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="text-center lg:text-left"
          >
            <motion.p
              variants={fadeInUp}
              className="mx-auto mb-5 w-fit rounded-full bg-[#ebf4ec] px-3.5 py-2 text-[0.72rem] font-bold tracking-[0.04em] text-[#3d7a50] lg:mx-0"
            >
              {landing.hero.badge}
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              className="text-balance text-[clamp(2.1rem,3.3vw,3.75rem)] font-bold leading-[1.08] tracking-[-0.02em] text-[#22323f]"
            >
              {landing.hero.title}{" "}
              <span className="text-[#e4bf3f]">
                {landing.hero.titleHighlight}
              </span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mx-auto mt-5 max-w-[620px] text-pretty text-[#728088] lg:mx-0"
            >
              {landing.hero.description}
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="mx-auto mt-7 flex w-full max-w-md flex-col items-center gap-3 sm:flex-row sm:justify-center lg:mx-0 lg:max-w-none lg:justify-start"
            >
              <Button className="w-full sm:w-auto">
                {common.buttons.tryTranslator}
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                {common.buttons.startLearning}
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="rounded-[28px] bg-[#46515a] p-5 shadow-[0_16px_40px_rgba(36,43,49,0.24)] lg:-mr-6 lg:p-8 xl:-mr-10"
          >
            <img
              src={heroImg}
              alt={landing.hero.imageAlt}
              className="block w-full rounded-[18px] lg:max-h-[580px] lg:object-cover"
            />
            <div className="mt-3.5 flex items-center gap-2.5 rounded-[14px] bg-[#f6f8f7] px-12 py-2.5 text-xs text-[#3f5d4a]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3c985f]" />
              <span className="text-balance">
                {landing.hero.realtimeCaption}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-[88px]">
        <div className="container">
          <h2 className="text-center text-[clamp(1.7rem,2.2vw,2.15rem)] font-bold text-[#253340] after:mx-auto after:mt-4 after:block after:h-0.5 after:w-[68px] after:bg-[#5e9a73] after:content-['']">
            {landing.sections.featureTitle}
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-10 grid gap-6 lg:grid-cols-3"
          >
            {landing.featureCards.map((feature, index) => {
              const Icon = featureIcons[index] ?? Languages;

              return (
                <motion.div key={feature.title} variants={fadeInUp}>
                  <Card className="h-full text-center">
                    <CardHeader className="pb-4">
                      <div
                        className="mx-auto mb-3.5 grid h-[42px] w-[42px] place-items-center rounded-xl bg-[#edf5ef] text-[#3e7a52]"
                        aria-hidden="true"
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#758389]">{feature.body}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="bg-[#f8faf9] py-16 md:py-[88px]">
        <div className="container">
          <h2 className="text-center text-[clamp(1.7rem,2.2vw,2.15rem)] font-bold text-[#253340] after:mx-auto after:mt-4 after:block after:h-0.5 after:w-[68px] after:bg-[#5e9a73] after:content-['']">
            {landing.sections.learningTitle}
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-11 grid gap-5 md:grid-cols-2 lg:grid-cols-4"
          >
            {landing.learningPoints.map((point) => (
              <motion.article
                key={point.title}
                variants={fadeInUp}
                className="px-1 py-3"
              >
                <h3 className="text-[1.07rem] font-bold text-[#22323f]">
                  <span className="mr-2 text-[#dcb340]">•</span>
                  {point.title}
                </h3>
                <p className="mt-3 text-[#758389]">{point.body}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-[#f4f7f5] py-16 md:py-[88px]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="container text-center"
        >
          <h2 className="text-balance text-[clamp(1.95rem,2.8vw,3rem)] font-bold text-[#22323f]">
            {landing.cta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-[660px] text-[#758389]">
            {landing.cta.description}
          </p>
          <Button className="mt-7" onClick={() => navigate("/dang-ky")}>
            {common.buttons.createFreeAccount}
          </Button>
        </motion.div>
      </section>
    </>
  );
}

export default LandingPage;
