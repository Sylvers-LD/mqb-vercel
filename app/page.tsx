import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Check, ChevronDown, Copy, Mail, BookOpen } from 'lucide-react';

const initialOptions = {
  stations: ['Station 1', 'Station 2'],
  prefixes: ['Mr.', 'Mrs.', 'Ms.'],
  suffixes: ['Jr.', 'Sr.', 'III'],
  artists: ['Artist 1', 'Artist 2'],
  songs: ['Song 1', 'Song 2'],
  labels: ['Label 1', 'Label 2'],
  contacts: ['Contact 1', 'Contact 2']
};

const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const TypeAheadCombobox = ({ value, onChange, options, onNewOption, label }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  const handleBlur = () => {
    if (inputValue && !options.includes(inputValue)) {
      onNewOption(inputValue);
    }
  };

  return (
    <div>
      <label className="block mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          className="w-full p-2 pr-8 border rounded bg-gray-100"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          list={`${label.toLowerCase()}-options`}
        />
        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        <datalist id={`${label.toLowerCase()}-options`}>
          {options.map(option => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>
    </div>
  );
};

const App = () => {
  const [formData, setFormData] = useState({
    station: '',
    date: '',
    amount: '',
    prefix: '',
    suffix: '',
    artist: '',
    song: '',
    label1: '',
    label2: '',
    contact1: '',
    contact2: '',
    specialInstructions: ''
  });

  const [records, setRecords] = useState(() => loadFromLocalStorage('records', []));
  const [options, setOptions] = useState(() => loadFromLocalStorage('options', initialOptions));
  const [searchDate, setSearchDate] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    localStorage.setItem('records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('options', JSON.stringify(options));
  }, [options]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date) return;
    
    // Original record text
    let text = `${formData.prefix}${formData.amount}${formData.suffix} ${formData.artist} "${formData.song}" ${formData.label1}`;
    
    if (formData.label2) {
      text += ` / ${formData.label2}`;
    }

    if (formData.contact1) {
      text += ` / ${formData.contact1}`;
    }

    if (formData.contact2) {
      text += ` / ${formData.contact2}`;
    }

    if (formData.specialInstructions) {
      text += ` / ${formData.specialInstructions}`;
    }

    // Format date for QuickBooks
    const [year, month, day] = formData.date.split('-');
    const formattedDate = `${month}/${day}/${year}`;

    // QuickBooks format with reformatted date
    const quickbooksText = `${formData.artist} "${formData.song}" (${formData.station}) ${formattedDate}`;

    const newRecord = {
      id: Date.now(),
      date: formData.date,
      text,
      quickbooksText,
      paid: false,
      invoiced: false
    };
    setRecords([...records, newRecord]);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      station: '',
      date: '',
      amount: '',
      prefix: '',
      suffix: '',
      artist: '',
      song: '',
      label1: '',
      label2: '',
      contact1: '',
      contact2: '',
      specialInstructions: ''
    });
  };

  const addNewOption = (category, value) => {
    setOptions(prev => ({
      ...prev,
      [category]: [...prev[category], value]
    }));
  };

  const togglePaid = (id) => {
    setRecords(records.map(record => 
      record.id === id ? { ...record, paid: !record.paid } : record
    ));
  };

  const toggleInvoiced = (id) => {
    setRecords(records.map(record => 
      record.id === id ? { ...record, invoiced: !record.invoiced } : record
    ));
  };

  const deleteRecord = (id) => {
    const updatedRecords = records.filter(record => record.id !== id);
    setRecords(updatedRecords);
  };

  const getFilteredRecords = () => {
    return records.filter(record => {
      const matchesDate = !searchDate || record.date === searchDate;
      const matchesKeyword = !searchKeyword || 
        record.text.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchesDate && matchesKeyword;
    });
  };

  const handleCopyRecord = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={handleSubmit}
            disabled={!formData.date}
            className={`p-2 rounded ${
              formData.date 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit
          </button>
          <button 
            onClick={resetForm}
            className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
          >
            Reset Form
          </button>
        </div>

        <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-full">
            <TypeAheadCombobox
              label="Station"
              value={formData.station}
              onChange={(value) => setFormData({...formData, station: value})}
              options={options.stations}
              onNewOption={(value) => addNewOption('stations', value)}
            />
          </div>

          <div>
            <label className="block mb-1">Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded bg-gray-100"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <div>
            <label className="block mb-1">Amount</label>
            <input
              type="number"
              className="w-full p-2 border rounded bg-gray-100"
              value={formData.amount || ''}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </div>

          <TypeAheadCombobox
            label="Prefix"
            value={formData.prefix}
            onChange={(value) => setFormData({...formData, prefix: value})}
            options={options.prefixes}
            onNewOption={(value) => addNewOption('prefixes', value)}
          />

          <TypeAheadCombobox
            label="Suffix"
            value={formData.suffix}
            onChange={(value) => setFormData({...formData, suffix: value})}
            options={options.suffixes}
            onNewOption={(value) => addNewOption('suffixes', value)}
          />

          <div className="col-span-full">
            <TypeAheadCombobox
              label="Artist"
              value={formData.artist}
              onChange={(value) => setFormData({...formData, artist: value})}
              options={options.artists}
              onNewOption={(value) => addNewOption('artists', value)}
            />
          </div>

          <div className="col-span-full">
            <TypeAheadCombobox
              label="Song"
              value={formData.song}
              onChange={(value) => setFormData({...formData, song: value})}
              options={options.songs}
              onNewOption={(value) => addNewOption('songs', value)}
            />
          </div>

          <TypeAheadCombobox
            label="Label 1"
            value={formData.label1}
            onChange={(value) => setFormData({...formData, label1: value})}
            options={options.labels}
            onNewOption={(value) => addNewOption('labels', value)}
          />

          <TypeAheadCombobox
            label="Label 2"
            value={formData.label2}
            onChange={(value) => setFormData({...formData, label2: value})}
            options={options.labels}
            onNewOption={(value) => addNewOption('labels', value)}
          />

          <TypeAheadCombobox
            label="Contact 1"
            value={formData.contact1}
            onChange={(value) => setFormData({...formData, contact1: value})}
            options={options.contacts}
            onNewOption={(value) => addNewOption('contacts', value)}
          />

          <TypeAheadCombobox
            label="Contact 2"
            value={formData.contact2}
            onChange={(value) => setFormData({...formData, contact2: value})}
            options={options.contacts}
            onNewOption={(value) => addNewOption('contacts', value)}
          />

          <div className="col-span-full">
            <label className="block mb-1">Special Instructions</label>
            <textarea
              className="w-full p-2 border rounded bg-gray-100 h-32"
              value={formData.specialInstructions}
              onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
            />
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1">Search by Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded bg-gray-100"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Search by Keyword</label>
            <input
              type="text"
              className="w-full p-2 border rounded bg-gray-100"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button 
            className="bg-cyan-400 text-white p-2 rounded hover:bg-cyan-500"
            onClick={() => {/* Search happens automatically */}}
          >
            Search
          </button>
          <button 
            className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
            onClick={() => {
              setSearchDate('');
              setSearchKeyword('');
            }}
          >
            Clear Search
          </button>
        </div>

        <div className="mt-4 bg-cyan-50 p-4 rounded max-h-96 overflow-y-auto">
          {getFilteredRecords().map(record => (
            <div key={record.id} className="mb-4 p-2 border-b">
              <div className="text-gray-500">
                {record.date}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => togglePaid(record.id)}
                  className={`p-1 rounded ${record.paid ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <Check className="w-4 h-4 text-white" />
                </button>
                <button 
                  onClick={() => toggleInvoiced(record.id)}
                  className={`p-1 rounded ${record.invoiced ? 'bg-pink-500' : 'bg-gray-300'}`}
                >
                  <Mail className="w-4 h-4 text-white" />
                </button>
                <div className="flex-grow">{record.text}</div>
                <button 
                  onClick={() => handleCopyRecord(record.text)}
                  className="p-1 rounded bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                  aria-label="Copy record"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4 text-white" />
                </button>
                <button 
                  onClick={() => handleCopyRecord(record.quickbooksText)}
                  className="p-1 rounded bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition-colors"
                  aria-label="Copy QuickBooks record"
                  title="Copy QuickBooks format to clipboard"
                >
                  <BookOpen className="w-4 h-4 text-white" />
                </button>
                <button 
                  onClick={() => deleteRecord(record.id)}
                  className="p-1 rounded bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
                  aria-label="Delete record"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
