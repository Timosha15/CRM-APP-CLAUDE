import { PrismaClient, ContactStatus, DealStage, TaskType, ActivityType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEAL_STAGE_LABEL } from "../src/lib/labels";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@victorcrm.app";
const DEMO_PASSWORD = "victor123";

const companiesData = [
  { name: "Northwind Traders", domain: "northwindtraders.com", industry: "Retail", size: "201-500" },
  { name: "Globex Dynamics", domain: "globexdynamics.com", industry: "Manufacturing", size: "501-1000" },
  { name: "Initech Solutions", domain: "initechsolutions.com", industry: "Software", size: "51-200" },
  { name: "Umbrella Health", domain: "umbrellahealth.com", industry: "Healthcare", size: "1000+" },
  { name: "Stark Analytics", domain: "starkanalytics.io", industry: "Data & Analytics", size: "11-50" },
  { name: "Wayfarer Logistics", domain: "wayfarerlogistics.com", industry: "Logistics", size: "201-500" },
  { name: "Bluepeak Media", domain: "bluepeakmedia.com", industry: "Media", size: "11-50" },
  { name: "Cascade Financial", domain: "cascadefinancial.com", industry: "Finance", size: "501-1000" },
  { name: "Ironclad Security", domain: "ironcladsecurity.com", industry: "Cybersecurity", size: "51-200" },
  { name: "Fernway Robotics", domain: "fernwayrobotics.com", industry: "Robotics", size: "11-50" },
];

const firstNames = [
  "Ava", "Liam", "Sophia", "Noah", "Isabella", "Mason", "Mia", "Ethan",
  "Amelia", "Lucas", "Harper", "Elijah", "Evelyn", "James", "Charlotte",
  "Benjamin", "Grace", "Henry", "Chloe", "Sebastian",
];
const lastNames = [
  "Bennett", "Ortiz", "Reyes", "Coleman", "Foster", "Hayes", "Price",
  "Sanders", "Morgan", "Wells", "Wu", "Kim", "Patel", "Novak", "Larsen",
  "Meyer", "Chow", "Diaz", "Fischer", "Blake",
];
const titles = [
  "VP of Sales", "Marketing Director", "CEO", "Head of Operations",
  "Procurement Manager", "CTO", "IT Director", "Founder", "COO",
  "Growth Lead",
];
const sources = ["Website", "Referral", "Cold Outreach", "Event", "LinkedIn", "Inbound Call"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("Seeding database...");

  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: DEMO_EMAIL,
      passwordHash,
      avatarColor: "#6d4cff",
    },
  });

  const teammate = await prisma.user.create({
    data: {
      name: "Jordan Blake",
      email: "jordan@victorcrm.app",
      passwordHash: await bcrypt.hash("victor123", 10),
      avatarColor: "#0ea5a4",
    },
  });

  const owners = [demoUser, teammate];

  const companies = [];
  for (const c of companiesData) {
    const company = await prisma.company.create({
      data: {
        ...c,
        phone: `+1 (415) 555-${randInt(1000, 9999)}`,
        address: `${randInt(100, 999)} Market St, San Francisco, CA`,
        ownerId: pick(owners).id,
        notes: "",
      },
    });
    companies.push(company);
  }

  const statuses: ContactStatus[] = ["LEAD", "PROSPECT", "CUSTOMER", "CHURNED"];
  const contacts = [];
  let nameIdx = 0;
  for (const company of companies) {
    const numContacts = randInt(1, 3);
    for (let i = 0; i < numContacts; i++) {
      const first = firstNames[nameIdx % firstNames.length];
      const last = lastNames[(nameIdx * 3) % lastNames.length];
      nameIdx++;
      const status = pick(statuses);
      const contact = await prisma.contact.create({
        data: {
          firstName: first,
          lastName: last,
          email: `${first.toLowerCase()}.${last.toLowerCase()}@${company.domain}`,
          phone: `+1 (415) 555-${randInt(1000, 9999)}`,
          title: pick(titles),
          status,
          source: pick(sources),
          companyId: company.id,
          ownerId: pick(owners).id,
        },
      });
      contacts.push(contact);

      await prisma.activity.create({
        data: {
          type: ActivityType.CREATED,
          content: `${contact.firstName} ${contact.lastName} was added as a ${status.toLowerCase()}.`,
          contactId: contact.id,
          companyId: company.id,
          ownerId: contact.ownerId,
        },
      });
    }
  }

  const stages: DealStage[] = ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
  const stageProbability: Record<DealStage, number> = {
    NEW: 10,
    QUALIFIED: 30,
    PROPOSAL: 55,
    NEGOTIATION: 75,
    WON: 100,
    LOST: 0,
  };
  const dealTitles = [
    "Annual platform license", "Enterprise rollout", "Pilot program",
    "Seat expansion", "Renewal + upsell", "Onboarding package",
    "Data integration project", "Premium support contract",
  ];

  const deals = [];
  for (const company of companies) {
    const companyContacts = contacts.filter((c) => c.companyId === company.id);
    const numDeals = randInt(1, 2);
    for (let i = 0; i < numDeals; i++) {
      const stage = pick(stages);
      const deal = await prisma.deal.create({
        data: {
          title: `${company.name} — ${pick(dealTitles)}`,
          value: randInt(4, 120) * 1000,
          stage,
          probability: stageProbability[stage],
          closeDate: daysFromNow(randInt(-10, 60)),
          companyId: company.id,
          contactId: companyContacts.length ? pick(companyContacts).id : null,
          ownerId: pick(owners).id,
        },
      });
      deals.push(deal);

      await prisma.activity.create({
        data: {
          type: ActivityType.CREATED,
          content: `Deal "${deal.title}" created in stage ${DEAL_STAGE_LABEL[stage]}.`,
          dealId: deal.id,
          companyId: company.id,
          ownerId: deal.ownerId,
        },
      });
    }
  }

  const taskTypes: TaskType[] = ["CALL", "EMAIL", "MEETING", "FOLLOW_UP", "TODO"];
  const taskTitles = [
    "Follow up on proposal", "Schedule demo call", "Send pricing sheet",
    "Check in after onboarding", "Confirm contract details", "Intro call",
    "Send case study", "Renewal conversation", "Discovery call",
    "Send meeting notes",
  ];

  for (let i = 0; i < 24; i++) {
    const withContact = Math.random() > 0.3;
    const withDeal = Math.random() > 0.5;
    const contact = withContact ? pick(contacts) : null;
    const deal = withDeal ? pick(deals) : null;
    const dueOffset = randInt(-5, 14);
    const completed = dueOffset < -1 && Math.random() > 0.4;

    await prisma.task.create({
      data: {
        title: pick(taskTitles),
        type: pick(taskTypes),
        dueDate: daysFromNow(dueOffset),
        completed,
        completedAt: completed ? daysFromNow(dueOffset + 1) : null,
        ownerId: pick(owners).id,
        contactId: contact?.id ?? null,
        companyId: contact?.companyId ?? deal?.companyId ?? null,
        dealId: deal?.id ?? null,
      },
    });
  }

  const noteSamples = [
    "Had a great call, they're interested in the premium tier.",
    "Left a voicemail, will try again tomorrow.",
    "Sent over the proposal, awaiting feedback.",
    "Budget approved on their end, moving to legal review.",
    "They asked for a competitor comparison sheet.",
    "Rescheduled demo to next week per their request.",
  ];
  for (let i = 0; i < 15; i++) {
    const contact = pick(contacts);
    await prisma.activity.create({
      data: {
        type: pick([ActivityType.NOTE, ActivityType.CALL, ActivityType.EMAIL]),
        content: pick(noteSamples),
        contactId: contact.id,
        companyId: contact.companyId,
        ownerId: pick(owners).id,
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
