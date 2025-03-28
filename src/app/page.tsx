import Hero from "@/components/Hero";
import Logos from "@/components/Logos";
import Benefits from "@/components/Benefits/Benefits";
import Container from "@/components/Container";
import CTA from "@/components/CTA";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const HomePage: React.FC = () => {
  return (
    <>
      <Header />
      <Hero />
      <Logos />
      <Container>
        <Benefits />

        <CTA />
      </Container>
      <Footer />
    </>
  );
};

export default HomePage;
