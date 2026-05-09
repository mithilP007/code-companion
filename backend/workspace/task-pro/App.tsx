import React from 'react';
import './App.css';

function Task({ task }: { task: string }) {
  return (
    <div className="flex justify-between p-4 border-b border-gray-300">
      <span className="text-lg font-medium" >{task}</span>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Done</button>
    </div>
  );
}

function App() {
  const tasks = ['Buy milk', 'Walk the dog', 'Do homework'];
  return (
    <div className="container mx-auto p-4 pt-6 mt-10">
      <h1 className="text-3xl font-bold mb-4">Task Manager</h1>
      {tasks.map((task, index) => (
        <Task key={index} task={task} />
      ))}
    </div>
  );
}

export default App;
