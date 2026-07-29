"use client";

import { Download, RefreshCw, Shuffle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Template = {
  name: string;
  suit: string;
  accent: string;
  hat: string;
  prop: string;
  expression: string;
};

const templates: Template[] = [
  { name: "Junior Analyst", suit: "#22252a", accent: "#c6a15b", hat: "None", prop: "Coffee", expression: "Locked in" },
  { name: "Portfolio Manager", suit: "#111111", accent: "#b78a3f", hat: "None", prop: "Terminal", expression: "Confident" },
  { name: "Quant", suit: "#1b2735", accent: "#d6bd85", hat: "None", prop: "Laptop", expression: "Thinking" },
  { name: "Risk Manager", suit: "#3b3d42", accent: "#9f7f45", hat: "Fedora", prop: "Briefcase", expression: "Locked in" },
  { name: "Managing Partner", suit: "#080808", accent: "#d4af67", hat: "None", prop: "Money", expression: "Smug" },
  { name: "Wall Street Intern", suit: "#343b48", accent: "#c9b27d", hat: "Yankees", prop: "Coffee", expression: "Thinking" },
  { name: "Macro Trader", suit: "#18243b", accent: "#d8b766", hat: "Dodgers", prop: "Terminal", expression: "Confident" },
  { name: "Options Trader", suit: "#252027", accent: "#c7a45d", hat: "None", prop: "Headphones", expression: "Laughing" },
  { name: "Market Maker", suit: "#1b2a27", accent: "#c8a55e", hat: "Fedora", prop: "Laptop", expression: "Smug" },
  { name: "Hedge Fund CEO", suit: "#050505", accent: "#e0bd70", hat: "None", prop: "Money", expression: "Confident" },
  { name: "The Billionaire", suit: "#111111", accent: "#f0ca72", hat: "Fedora", prop: "Cigar", expression: "Smug" },
];

const hats = ["None", "Dodgers", "Yankees", "Fedora"];
const props = ["Money", "Coffee", "Laptop", "Terminal", "Cigar", "Headphones", "Briefcase"];
const expressions = ["Confident", "Smug", "Laughing", "Locked in", "Thinking"];

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
}

export function PfpStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[1]);
  const [hat, setHat] = useState(selectedTemplate.hat);
  const [prop, setProp] = useState(selectedTemplate.prop);
  const [expression, setExpression] = useState(selectedTemplate.expression);
  const [goldChain, setGoldChain] = useState(true);
  const [bullPin, setBullPin] = useState(false);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const image = new Image();
    image.src = "/hedge-logo.jpg";
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#f7f7f4";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      context.globalCompositeOperation = "multiply";
      context.fillStyle = `${selectedTemplate.suit}3d`;
      context.fillRect(0, 630, 1024, 394);
      context.globalCompositeOperation = "source-over";

      if (hat !== "None") {
        context.fillStyle = hat === "Fedora" ? "#171717" : selectedTemplate.suit;
        roundRect(context, 275, 110, 490, hat === "Fedora" ? 90 : 118, 34);
        context.fillRect(225, 190, 590, 34);
        context.fillStyle = selectedTemplate.accent;
        context.font = "800 46px Arial";
        context.textAlign = "center";
        context.fillText(hat === "Dodgers" ? "LA" : hat === "Yankees" ? "NY" : "H", 520, 184);
      }

      if (goldChain) {
        context.strokeStyle = selectedTemplate.accent;
        context.lineWidth = 13;
        context.beginPath();
        context.arc(515, 790, 155, 0.15, Math.PI - 0.15);
        context.stroke();
      }

      if (bullPin) {
        context.fillStyle = selectedTemplate.accent;
        context.beginPath();
        context.arc(320, 795, 25, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#111";
        context.font = "900 20px Arial";
        context.fillText("↑", 320, 803);
      }

      context.fillStyle = selectedTemplate.accent;
      if (prop === "Coffee") {
        roundRect(context, 745, 730, 105, 132, 14);
        context.strokeStyle = selectedTemplate.accent;
        context.lineWidth = 15;
        context.beginPath();
        context.arc(850, 785, 45, -1.2, 1.2);
        context.stroke();
      } else if (prop === "Laptop" || prop === "Terminal") {
        context.fillStyle = "#121212";
        roundRect(context, 255, 735, 520, 225, 16);
        context.fillStyle = selectedTemplate.accent;
        context.font = "700 30px monospace";
        context.fillText(prop === "Terminal" ? "HEDGE / LIVE" : "HEDGE CAPITAL", 515, 850);
      } else if (prop === "Cigar") {
        context.save();
        context.translate(705, 650);
        context.rotate(-0.2);
        context.fillStyle = "#74431f";
        roundRect(context, 0, 0, 180, 24, 10);
        context.fillStyle = selectedTemplate.accent;
        context.fillRect(130, 0, 18, 24);
        context.restore();
      } else if (prop === "Headphones") {
        context.strokeStyle = "#111";
        context.lineWidth = 28;
        context.beginPath();
        context.arc(512, 485, 300, Math.PI, 0);
        context.stroke();
      } else if (prop === "Briefcase") {
        context.fillStyle = "#171717";
        roundRect(context, 610, 750, 300, 210, 18);
        context.strokeStyle = selectedTemplate.accent;
        context.lineWidth = 10;
        context.strokeRect(610, 750, 300, 210);
      }

      context.strokeStyle = expression === "Laughing" ? selectedTemplate.accent : "#1d1712";
      context.lineWidth = expression === "Locked in" ? 8 : 5;
      context.beginPath();
      if (expression === "Smug") {
        context.arc(525, 620, 65, 0.05, 1.15);
      } else if (expression === "Laughing") {
        context.arc(520, 610, 58, 0.1, Math.PI - 0.1);
      } else if (expression === "Thinking") {
        context.moveTo(475, 630);
        context.quadraticCurveTo(540, 612, 575, 635);
      } else {
        context.moveTo(475, 630);
        context.quadraticCurveTo(525, 650, 585, 622);
      }
      context.stroke();

      context.fillStyle = "rgba(255,255,255,0.94)";
      roundRect(context, 36, 900, 490, 82, 12);
      context.fillStyle = "#111";
      context.textAlign = "left";
      context.font = "900 28px Arial";
      context.fillText(selectedTemplate.name.toUpperCase(), 62, 946);
      context.font = "600 18px Arial";
      context.fillStyle = "#87672f";
      context.fillText("HEDGE CAPITAL MANAGEMENT", 62, 970);
    };
  }, [bullPin, expression, goldChain, hat, prop, selectedTemplate]);

  useEffect(() => {
    render();
  }, [render]);

  function applyTemplate(template: Template) {
    setSelectedTemplate(template);
    setHat(template.hat);
    setProp(template.prop);
    setExpression(template.expression);
  }

  function randomize() {
    const template = templates[Math.floor(Math.random() * templates.length)];
    applyTemplate(template);
    setGoldChain(Math.random() > 0.35);
    setBullPin(Math.random() > 0.55);
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `hedge-${selectedTemplate.name.toLowerCase().replaceAll(" ", "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="pfp-studio">
      <div className="pfp-preview">
        <canvas
          ref={canvasRef}
          width={1024}
          height={1024}
          aria-label={`Hedge profile picture preview: ${selectedTemplate.name}`}
        />
        <div className="pfp-preview-actions">
          <button className="button button-dark" type="button" onClick={randomize}>
            <Shuffle size={16} aria-hidden="true" />
            Randomize
          </button>
          <button className="button button-gold" type="button" onClick={download}>
            <Download size={16} aria-hidden="true" />
            Download PNG
          </button>
        </div>
      </div>

      <div className="pfp-controls">
        <div className="control-heading">
          <div>
            <span>IDENTITY DESK</span>
            <h3>{selectedTemplate.name}</h3>
          </div>
          <button type="button" onClick={render} aria-label="Refresh preview">
            <RefreshCw size={17} aria-hidden="true" />
          </button>
        </div>

        <fieldset>
          <legend>Templates</legend>
          <div className="template-grid">
            {templates.map((template) => (
              <button
                className={selectedTemplate.name === template.name ? "active" : ""}
                key={template.name}
                type="button"
                onClick={() => applyTemplate(template)}
              >
                {template.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Headwear</legend>
          <div className="segmented-control">
            {hats.map((option) => (
              <button
                className={hat === option ? "active" : ""}
                key={option}
                type="button"
                onClick={() => setHat(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Desk prop</legend>
          <div className="segmented-control">
            {props.map((option) => (
              <button
                className={prop === option ? "active" : ""}
                key={option}
                type="button"
                onClick={() => setProp(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Expression</legend>
          <div className="segmented-control">
            {expressions.map((option) => (
              <button
                className={expression === option ? "active" : ""}
                key={option}
                type="button"
                onClick={() => setExpression(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="toggle-row">
          <label>
            <input
              type="checkbox"
              checked={goldChain}
              onChange={(event) => setGoldChain(event.target.checked)}
            />
            <span>Gold chain</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={bullPin}
              onChange={(event) => setBullPin(event.target.checked)}
            />
            <span>Bull pin</span>
          </label>
        </div>
      </div>
    </div>
  );
}
