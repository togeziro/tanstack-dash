import { faker } from '@faker-js/faker';
import { db } from '../src/lib/db';
import { products, users, kanbanColumns, kanbanTasks } from '../src/lib/db/schema';

const PRODUCT_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Toys',
  'Groceries',
  'Books',
  'Jewelry',
  'Beauty Products'
] as const;

const USER_ROLES = [
  'Developer',
  'Designer',
  'Manager',
  'QA',
  'DevOps',
  'Product Owner'
] as const;

const USER_STATUSES = ['Active', 'Inactive', 'Invited'] as const;

async function seedProducts(count = 20) {
  const rows = Array.from({ length: count }, (_, i) => ({
    photo_url: `https://api.slingacademy.com/public/sample-products/${i + 1}.png`,
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price({ min: 5, max: 500, dec: 2 }),
    category: faker.helpers.arrayElement(PRODUCT_CATEGORIES)
  }));

  await db.delete(products);
  await db.insert(products).values(rows);
  console.log(`Seeded ${rows.length} products`);
}

async function seedUsers(count = 50) {
  const rows = Array.from({ length: count }, () => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number({ style: 'national' }),
    status: faker.helpers.arrayElement(USER_STATUSES),
    role: faker.helpers.arrayElement(USER_ROLES)
  }));

  await db.delete(users);
  await db.insert(users).values(rows);
  console.log(`Seeded ${rows.length} users`);
}

async function seedKanban() {
  await db.delete(kanbanTasks);
  await db.delete(kanbanColumns);


  const columnData = [
    { slug: 'backlog', title: 'Backlog', position: 0 },
    { slug: 'inProgress', title: 'In Progress', position: 1 },
    { slug: 'review', title: 'Review', position: 2 },
    { slug: 'done', title: 'Done', position: 3 },
  ];

  await db.insert(kanbanColumns).values(columnData);

  const taskData: (typeof kanbanTasks.$inferInsert)[] = [
    { column_slug: 'backlog', title: 'Migrate to Stripe billing API', priority: 'high', assignee: 'Sarah Chen', due_date: '2026-04-08', position: 0 },
    { column_slug: 'backlog', title: 'Add CSV export to reports', priority: 'medium', assignee: 'Marcus Rivera', due_date: '2026-04-12', position: 1 },
    { column_slug: 'backlog', title: 'Update onboarding flow copy', priority: 'low', assignee: 'Priya Sharma', due_date: '2026-04-15', position: 2 },
    { column_slug: 'backlog', title: 'Audit RBAC permissions', priority: 'medium', assignee: 'Jordan Kim', due_date: '2026-04-10', position: 3 },
    { column_slug: 'inProgress', title: 'Refactor notification service', priority: 'high', assignee: 'Alex Turner', due_date: '2026-04-03', position: 0 },
    { column_slug: 'inProgress', title: 'Build team invitation flow', priority: 'medium', assignee: 'Emily Nakamura', due_date: '2026-04-06', position: 1 },
    { column_slug: 'inProgress', title: 'Fix timezone handling in scheduler', priority: 'high', assignee: 'Sarah Chen', due_date: '2026-04-04', position: 2 },
    { column_slug: 'done', title: 'SSO integration with Okta', priority: 'high', assignee: 'Jordan Kim', due_date: '2026-03-22', position: 0 },
    { column_slug: 'done', title: 'Dashboard analytics charts', priority: 'medium', assignee: 'Marcus Rivera', due_date: '2026-03-20', position: 1 },
    { column_slug: 'done', title: 'Webhook retry mechanism', priority: 'low', assignee: 'Alex Turner', due_date: '2026-03-18', position: 2 },
  ];

  await db.insert(kanbanTasks).values(taskData);
  console.log(`Seeded ${columnData.length} columns, ${taskData.length} tasks`);
}

async function main() {
  faker.seed(42);
  await seedProducts();
  await seedUsers();
  await seedKanban();
  console.log('Seed complete');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
