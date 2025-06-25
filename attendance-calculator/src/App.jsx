import { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [week, setWeek] = useState({
    mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0
  });
  const [attended, setAttended] = useState(0);
  const [held, setHeld] = useState(0);
  const [target, setTarget] = useState(75);
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setWeek({ ...week, [id]: Math.min(8, parseInt(value || 0)) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const today = new Date();
    const end = new Date(endDate);
    let current = new Date(today);
    let future = 0;

    while (current <= end) {
      const day = current.getDay(); // 0:Sun, 1:Mon...6:Sat
      const map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      if (day >= 1 && day <= 6) {
        future += week[map[day]] || 0;
      }
      current.setDate(current.getDate() + 1);
    }

    const finalTotal = held + future;
    const required = Math.ceil((target / 100) * finalTotal);
    const maxAbsents = finalTotal - required;
    const currentAbsents = held - attended;
    const canBunk = maxAbsents - currentAbsents;

    setResult({
      future,
      finalTotal,
      required,
      canBunk,
      chartData: {
        attended,
        missed: Math.max(held - attended, 0)
      }
    });
  };

  const reset = () => {
    setWeek({ mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0 });
    setAttended(0);
    setHeld(0);
    setTarget(75);
    setEndDate('');
    setResult(null);
  };

  return (
    <div className="main-wrapper">
      <div className="container">
        <h1>📅 Attendance Calculator</h1>
        <form onSubmit={handleSubmit}>
          <div className="week-inputs">
            {Object.keys(week).map(day => (
              <label key={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}:
                <input
                  type="number"
                  id={day}
                  min="0"
                  max="8"
                  value={week[day]}
                  onChange={handleChange}
                />
              </label>
            ))}
          </div>
          <div className="other-inputs">
            <label>Attended:
              <input type="number" value={attended} onChange={e => setAttended(+e.target.value)} />
            </label>
            <label>Held:
              <input type="number" value={held} onChange={e => setHeld(+e.target.value)} />
            </label>
            <label>Target %:
              <input type="number" value={target} onChange={e => setTarget(+e.target.value)} />
            </label>
            <label>End Date:
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </label>
          </div>
          <div className="buttons">
            <button type="submit">Calculate</button>
            <button type="button" onClick={reset}>Reset</button>
          </div>
        </form>
      </div>

      {result && (
        <div className="result-panel">
          <div className="summary">
            <p>📘 Future Classes: <strong>{result.future}</strong></p>
            <p>📊 Final Total: <strong>{result.finalTotal}</strong></p>
            <p>✅ Required to Attend: <strong>{result.required}</strong></p>
            <p>🚫 Can Miss: <strong>{Math.max(0, result.canBunk)}</strong></p>
          </div>

          <div className="chart">
            <Doughnut
              data={{
                labels: ['Attended', 'Missed'],
                datasets: [{
                  data: [result.chartData.attended, result.chartData.missed],
                  backgroundColor: ['#32e875', '#ff6b6b'],
                  borderWidth: 0
                }]
              }}
              options={{
                plugins: {
                  legend: {
                    labels: { color: '#e0e0e0' }
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
