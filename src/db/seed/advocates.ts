import { faker } from "@faker-js/faker";

const specialties = [
  "Bipolar",
  "LGBTQ",
  "Medication/Prescribing",
  "Suicide History/Attempts",
  "General Mental Health (anxiety, depression, stress, grief, life transitions)",
  "Men's issues",
  "Relationship Issues (family, friends, couple, etc)",
  "Trauma & PTSD",
  "Personality disorders",
  "Personal growth",
  "Substance use/abuse",
  "Pediatrics",
  "Women's issues (post-partum, infertility, family planning)",
  "Chronic pain",
  "Weight loss & nutrition",
  "Eating disorders",
  "Diabetic Diet and nutrition",
  "Coaching (leadership, career, academic and wellness)",
  "Life coaching",
  "Obsessive-compulsive disorders",
  "Neuropsychological evaluations & testing (ADHD testing)",
  "Attention and Hyperactivity (ADHD)",
  "Sleep issues",
  "Schizophrenia and psychotic disorders",
  "Learning disorders",
  "Domestic abuse",
];

/**
 * Helper to pick a random subset of specialties from the above array
 */
function getRandomSpecialties() {
  // Decide how many specialties the advocate will have
  const count = faker.number.int({ min: 1, max: 4 });
  // Shuffle the specialties array and take 'count' items
  return faker.helpers.arrayElements(specialties, count);
}

/**
 * Generate a specified number of random advocates
 */
export function generateAdvocates(count: number) {
  const records = [];

  for (let i = 0; i < count; i++) {
    records.push({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      city: faker.location.city(),
      degree: faker.helpers.arrayElement(["MD", "PhD", "MSW", "PsyD", "NP"]),
      specialties: getRandomSpecialties(),
      yearsOfExperience: faker.number.int({ min: 1, max: 20 }),
      // 10-digit US phone number, or any format you like:
      phoneNumber: Number(faker.string.numeric(10)),
    });
  }

  return records;
}
