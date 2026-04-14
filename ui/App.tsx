import { h } from 'preact';

export const App = () => (
  <main class="shell">
    <h1>reweCart minimal scheduler UI</h1>
    <p>Use these values with <code>reweCart scheduler start</code>.</p>
    <ul>
      <li>Schedule: Saturday at 12:05</li>
      <li>Target slot day: Friday (2 weeks ahead)</li>
      <li>Pickup window: 18:00 - 20:00</li>
    </ul>
    <pre>reweCart scheduler start --schedule-day sat --schedule-time 12:05 --target-day fri --weeks-ahead 2 --window 18:00-20:00 --once</pre>
  </main>
);
