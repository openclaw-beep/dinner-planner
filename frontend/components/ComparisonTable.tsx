'use client';

const rows = [
  { feature: 'Commission', dinnerPlanner: '5%', openTable: '15-30%' },
  { feature: 'Booking Method', dinnerPlanner: 'Web, WhatsApp, Voice', openTable: 'Web, App' },
  { feature: 'Reviews', dinnerPlanner: 'Verified only', openTable: 'Mixed' },
  { feature: 'Local Focus', dinnerPlanner: 'Ottawa-first', openTable: 'Generic' },
  { feature: 'Response Time', dinnerPlanner: 'Real-time', openTable: 'Delayed' }
];

export default function ComparisonTable() {
  return (
    <section className="landing-section landing-section--tinted">
      <div className="landing-shell">
        <div className="landing-section__heading reveal-on-scroll">
          <h2>Dinner Planner vs OpenTable</h2>
          <p>A booking platform designed for local speed and fair economics.</p>
        </div>

        <div className="landing-table-wrap reveal-on-scroll">
          <table className="landing-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Dinner Planner</th>
                <th>OpenTable</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td>{row.dinnerPlanner}</td>
                  <td>{row.openTable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
