// Recent stays small (least survey support). Coming shows what jobs and research will hold,
// each drawn as an unbuilt ASCII block: the floors the hub adds next.

import { useState } from "react";
import { Bell, BellRing } from "lucide-react";

import type { Person, RecentItem } from "../sample-data";
import { ASCII_CUBE, ASCII_DIVIDER, Ascii, Avatar, SampleTag, SectionHeader } from "../primitives";

type RecentComingProps = {
  recent: RecentItem[];
  people: Person[];
};

const COMING = [
  { id: "jobs", title: "Jobs", text: "Co-ops, internships, and on-campus jobs from CECS partners, matched to your major and your hours." },
  { id: "research", title: "Research", text: "Lab openings and undergraduate research with CECS faculty, with what each lab expects per week." },
];

export const RecentComing = ({ recent, people }: RecentComingProps) => {
  const [notify, setNotify] = useState<Set<string>>(new Set());
  const personById = new Map(people.map((p) => [p.id, p]));

  const toggleNotify = (id: string) =>
    setNotify((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <Ascii art={ASCII_DIVIDER} className="nb-ascii-divider" />
      <div className="nb-tail-grid">
        <section className="nb-card nb-recent" aria-labelledby="recent-title" id="recent" data-reveal="">
          <div className="nb-card-head">
            <div>
              <p className="nb-kicker font-pixel">RECENT</p>
              <h2 id="recent-title" className="nb-card-title font-display">
                From your connections
              </h2>
            </div>
            <SampleTag />
          </div>
          <p className="nb-muted nb-small">A short log of what changed for people you are connected to.</p>
          <ol className="nb-timeline">
            {recent.map((item) => {
              const person = personById.get(item.personId);
              if (!person) return null;
              return (
                <li key={item.id} className="nb-timeline-item">
                  <Avatar initials={person.initials} size="sm" />
                  <p>
                    <span className="font-display nb-strong">{person.name}</span> {item.text}
                    <span className="nb-timeline-when">{item.when}</span>
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="nb-coming" aria-labelledby="coming-title" id="coming">
          <SectionHeader id="coming-title" kicker="COMING WINTER 2027" title="Jobs and research">
            Two more parts of the hub are being built. Here is what they will hold.
          </SectionHeader>
          <div className="nb-coming-cards">
            {COMING.map((item) => {
              const on = notify.has(item.id);
              return (
                <div key={item.id} className="nb-card nb-coming-card" data-reveal="">
                  <Ascii art={ASCII_CUBE} className="nb-ascii-cube" />
                  <h3 className="nb-card-title font-display">{item.title}</h3>
                  <p className="nb-muted">{item.text}</p>
                  <button type="button" className="nb-text-btn nb-notify" aria-pressed={on} onClick={() => toggleNotify(item.id)}>
                    {on ? <BellRing className="h-4 w-4" aria-hidden="true" /> : <Bell className="h-4 w-4" aria-hidden="true" />}
                    {on ? "We will tell you when it opens" : "Tell me when it opens"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
};
