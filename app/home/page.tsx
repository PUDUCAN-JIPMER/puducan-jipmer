"use client";
import { ShieldCheck, Database, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ExpandablePanelProps {
  title: string;
  children: React.ReactNode;
}

function ExpandablePanel({ title, children }: ExpandablePanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-md mb-4 bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`panel-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="w-full flex justify-between items-center px-4 py-3 font-semibold text-blue-700 hover:bg-blue-50 transition"
      >
        {title}
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div
          id={`panel-${title.replace(/\s+/g, "-").toLowerCase()}`}
          className="px-4 pb-4 text-gray-700"
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface TabConfig {
  id: string;
  label: string;
  content: string;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs: TabConfig[] = [
    {
      id: "overview",
      label: "Overview",
      content: "The Overview section provides a summary of the project's goals, methodology, and its impact on cancer care delivery across India.",
    },
    {
      id: "prevention",
      label: "Prevention",
      content: "The Prevention section highlights awareness programs, screening initiatives, and lifestyle recommendations to reduce cancer risk.",
    },
    {
      id: "management",
      label: "Management",
      content: "The Management section focuses on patient data collection, treatment tracking, and follow-up support for healthcare professionals.",
    },
  ];

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-12 sm:mt-16 lg:mt-20">
      {/* 🔹 Logo section */}
      <div className="flex flex-col items-center mb-8">
        <img
          src="/jipmer-logo.png"
          alt="PuduCan JIPMER Logo"
          width={120}
          height={120}
          className="rounded-md shadow-md"
        />
      </div>

      {/* Existing tabbed section */}
      <h2 className="text-4xl font-extrabold tracking-tight text-center text-blue-800 sm:text-5xl mb-6">
        Welcome to the PuduCan Portal
      </h2>
      <p className="text-lg leading-7 text-gray-800 sm:text-xl text-center max-w-3xl mx-auto mb-10">
        This portal is part of the PuduCan project — a national study led by JIPMER,
        aimed at improving patient‑reported experiences along the cancer care continuum.
      </p>

      <div className="flex flex-wrap justify-center gap-4 border-b border-gray-800 pb-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
            className={`px-5 py-2 rounded-t-md font-medium transition ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-white hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="border rounded-md mb-4 bg-black text-gray-100 shadow-sm p-4">
        <p>{activeTabContent}</p>
      </div>

      {/* 🔽 Informative content blocks */}
      <h3 className="text-3xl font-semibold text-blue-700 mb-6 text-center">
        Informative Resources
      </h3>

      <ExpandablePanel title="Fact Sheets">
        <div className="flex items-center gap-4">
          <ShieldCheck className="h-8 w-8 text-blue-600 flex-shrink-0" />
          <p className="text-gray-800">
            Access detailed fact sheets on cancer types, treatment protocols, and patient
            care guidelines curated by JIPMER experts.
          </p>
        </div>
      </ExpandablePanel>

      <ExpandablePanel title="Databases">
        <div className="flex items-center gap-4">
          <Database className="h-8 w-8 text-green-600 flex-shrink-0" />
          <p className="text-gray-800">
            Explore national and institutional databases that support research and
            evidence based decision making in oncology.
          </p>
        </div>
      </ExpandablePanel>

      <ExpandablePanel title="Initiatives">
        <div className="flex items-center gap-4">
          <Activity className="h-8 w-8 text-purple-600 flex-shrink-0" />
          <p className="text-gray-700">
            Learn about ongoing initiatives, outreach programs, and collaborations aimed
            at improving cancer prevention and management.
          </p>
        </div>
      </ExpandablePanel>
    </div>
  );
}

