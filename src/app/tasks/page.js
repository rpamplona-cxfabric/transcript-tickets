import { getTasks } from '../../lib/db';
import TasksClient from './_components/TasksClient';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <TasksClient initialTasks={tasks} />
  );
}
