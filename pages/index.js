import Head from "next/head";
import Image from "next/image";
import buildspaceLogo from "../assets/buildspace-logo.png";
import { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../components/CheckoutForm";

const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const Home = () => {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescriptio] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [showCoverLetter, setToggleCoverLetterView] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntent, setPaymentIntent] = useState("");
  useEffect(() => {
    // Create PaymentIntent as soon as the page loads using our local API
    fetch("api/stripe_intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 100,
        payment_intent_id: "",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.client_secret), setPaymentIntent(data.id);
      });
  }, []);

  const appearance = {
    theme: "stripe",
    labels: "floating",
  };
  const options = {
    clientSecret,
    appearance,
  };

  const callGenerateEndpoint = async () => {
    if (jobDescription.length < 40 || jobDescription.length < 40) {
      setErrorMessage(
        "Please include a complete unformatted copy of the resume and the job description"
      );
      return;
    }
    setErrorMessage("");
    setIsGenerating(true);

    console.log("Calling OpenAI...");
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resume, jobDescription }),
    });

    const data = await response.json();
    const { output } = data;
    console.log("OpenAI replied...", output.text);

    setCoverLetter(`${JSON.stringify(output.text, undefined, 2)}`);
    setIsGenerating(false);
    setToggleCoverLetterView(true);
  };
  return (
    <div className="root">
      <Head>
        <title>Cover Letter Generator</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Cover Letter Generator</h1>
          </div>
          {showCoverLetter && (
            <div
              style={{
                marginTop: "62px",
                padding: "24px",
                background: "white",
                fontSize: "18px",
                color: "grey",
                whiteSpace: "pre-line",
              }}
            >
              {coverLetter}
            </div>
          )}
          {!showCoverLetter && (
            <div className="header-subtitle">
              <h2>Upload your CV and the Job Application and see the magic</h2>
              <textarea
                onChange={(v) => setResume(v.target.value)}
                value={resume}
                style={{
                  width: "100%",
                  height: "300px",
                  borderRadius: "10px",
                  padding: "18px",
                  fontSize: "18px",
                }}
                placeholder="Copy and paste your Resume here"
              />

              <textarea
                onChange={(v) => setJobDescriptio(v.target.value)}
                value={jobDescription}
                style={{
                  marginTop: "24px",
                  width: "100%",
                  height: "300px",
                  borderRadius: "10px",
                  padding: "18px",
                  fontSize: "18px",
                }}
                placeholder="Paste here the Job Description"
              />
              {errorMessage && (
                <div
                  style={{
                    color: "red",
                  }}
                >
                  {errorMessage}
                </div>
              )}
              <div
                style={{
                  paddingTop: "20px",
                  align: "center",
                  margin: "auto",
                  textAlign: "center",
                  right: "0",
                }}
              >
                <button
                  style={{
                    marginTop: "20px",
                    align: "center",
                    margin: "auto",
                    textAlign: "center",
                    padding: "18px 84px",
                    borderRadius: "12px",
                    background: "#f8481c",
                    border: "none",
                    fontSize: "16px",
                    color: "white",
                    right: "0",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    callGenerateEndpoint();
                  }}
                >
                  Submit
                </button>
              </div>
              {isGenerating && "Loading"}
            </div>
          )}

          {clientSecret && (
            <Elements options={options} stripe={stripe}>
              <CheckoutForm paymentIntent={paymentIntent} />
            </Elements>
          )}
        </div>
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-writer"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
