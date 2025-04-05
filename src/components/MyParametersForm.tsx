import React, { useState } from 'react';

// Keep FormData interface local to this form
interface FormData {
  name: string;
  gender: 'Male' | 'Female' | '';
  age: number | '';
  height: number | '';
  weight: number | '';
  activityLevel: 'Low' | 'Medium' | 'High' | '';
  goal: 'Lose weight' | 'Maintain' | 'Gain muscle' | '';
}

interface MyParametersFormProps {
  onSubmit: (data: FormData) => void; // Callback for when form is submitted
}

const MyParametersForm: React.FC<MyParametersFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    activityLevel: '', // Changed default to '' to force selection
    goal: '', // Changed default to '' to force selection
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'age' || name === 'height' || name === 'weight' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({
      ...prevData,
      gender: e.target.value as 'Male' | 'Female',
    }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation example (can be expanded)
    if (Object.values(formData).some(value => value === '')) {
        alert('Please fill in all fields.');
        return;
    }
     // Add specific checks for number inputs being valid numbers > 0
    if (Number(formData.age) <= 0 || Number(formData.height) <= 0 || Number(formData.weight) <= 0) {
         alert('Age, height, and weight must be positive numbers.');
        return;
    }

    console.log('Submitting Form data:', formData);
    onSubmit(formData); // Pass data to parent component
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4"> {/* Removed padding/bg/shadow - handled by parent */}
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
        <div className="mt-1 flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={formData.gender === 'Male'}
              onChange={handleGenderChange}
              className="form-radio h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:bg-gray-700 dark:checked:bg-indigo-500 dark:focus:ring-offset-gray-800"
              required
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Male</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={formData.gender === 'Female'}
              onChange={handleGenderChange}
              className="form-radio h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:bg-gray-700 dark:checked:bg-indigo-500 dark:focus:ring-offset-gray-800"
              required
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Female</span>
          </label>
        </div>
      </div>

      {/* Age */}
      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleChange}
          min="1" // HTML5 validation
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      {/* Height */}
      <div>
        <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Height (cm)</label>
        <input
          type="number"
          id="height"
          name="height"
          value={formData.height}
          onChange={handleChange}
          min="1" // HTML5 validation
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      {/* Weight */}
      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg)</label>
        <input
          type="number"
          id="weight"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
          min="1" // HTML5 validation
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          required
        />
      </div>

      {/* Activity Level */}
      <div>
        <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activity Level</label>
        <select
          id="activityLevel"
          name="activityLevel"
          value={formData.activityLevel}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
          required
        >
          <option value="" disabled>Select activity level</option>
          <option value="Low">Low (Lightly Active)</option> {/* Clarified mapping */}
          <option value="Medium">Medium (Moderately Active)</option> {/* Clarified mapping */}
          <option value="High">High (Very Active)</option> {/* Clarified mapping */}
        </select>
      </div>

      {/* Goal */}
      <div>
        <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goal</label>
        <select
          id="goal"
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
          required
        >
          <option value="" disabled>Select your goal</option>
          <option value="Lose weight">Lose weight</option>
          <option value="Maintain">Maintain</option>
          <option value="Gain muscle">Gain muscle</option>
        </select>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
        >
          Calculate Goals
        </button>
      </div>
    </form>
  );
};

export default MyParametersForm;
