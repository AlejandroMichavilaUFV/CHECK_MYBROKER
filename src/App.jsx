import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, TrendingUp, Clock, Calendar } from 'lucide-react';
import Fuse from 'fuse.js';
import instruments from './data/instruments.json';

const InstrumentCard = ({ instrument, isRecent }) => {
  const [expanded, setExpanded] = useState(false);
  const isAvailable = instrument.maxOpenQuantity > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{instrument.shortName}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              instrument.type === 'ETF' ? 'bg-blue-100 text-blue-700' :
              instrument.type === 'Stock' ? 'bg-green-100 text-green-700' :
              'bg-purple-100 text-purple-700'
            }`}>{instrument.type}</span>
            {isRecent && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                NEW
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{instrument.name}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="font-mono">{instrument.ticker}</span>
            <span className="font-semibold">{instrument.currencyCode}</span>
            {instrument.extendedHours && (
              <span className="flex items-center gap-1 text-blue-600">
                <Clock size={12} />
                Extended Hours
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>{isAvailable ? 'Available' : 'Unavailable'}</div>
          {isAvailable && (
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors">
                Buy
              </button>
              <button className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors">
                Sell
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        {expanded ? (
          <>
            <ChevronUp size={16} />
            Hide Details
          </>
        ) : (
          <>
            <ChevronDown size={16} />
            Show Details
          </>
        )}
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">ISIN:</span>
            <span className="ml-2 font-mono text-gray-900">{instrument.isin}</span>
          </div>
          <div>
            <span className="text-gray-500">Schedule ID:</span>
            <span className="ml-2 text-gray-900">{instrument.workingScheduleId}</span>
          </div>
          <div>
            <span className="text-gray-500">Max Quantity:</span>
            <span className="ml-2 text-gray-900">{instrument.maxOpenQuantity.toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <Calendar size={14} className="text-gray-500 mr-2" />
            <span className="text-gray-500">Added:</span>
            <span className="ml-2 text-gray-900">
              {new Date(instrument.addedOn).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function TradingInstruments() {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // actualizado al pulsar "Search"
  const [typeFilter, setTypeFilter] = useState('All');
  const [currencyFilter, setCurrencyFilter] = useState('All');

  const recentDate = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return thirtyDaysAgo;
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(instruments, {
      keys: ['name', 'ticker', 'isin', 'shortName'],
      threshold: 0.3,
    });
  }, []);

  const filteredAndSorted = useMemo(() => {
    if (!searchTerm) return []; // nada se muestra hasta buscar

    // Fuse devuelve los resultados ordenados por relevancia (más parecido)
    let results = fuse.search(searchTerm).slice(0, 10).map(r => r.item); 

    // Filtrar por tipo y moneda sin cambiar el orden por relevancia
    results = results.filter(inst => {
      const matchesType = typeFilter === 'All' || inst.type === typeFilter;
      const matchesCurrency = currencyFilter === 'All' || inst.currencyCode === currencyFilter;
      return matchesType && matchesCurrency;
    });

    return results;
  }, [searchTerm, typeFilter, currencyFilter, fuse]);

  const types = ['All', ...new Set(instruments.map(i => i.type))];
  const currencies = ['All', ...new Set(instruments.map(i => i.currencyCode))];

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Trading 212 Instruments</h1>
          </div>
          <p className="text-gray-600">Browse and search available trading instruments</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative mb-4 flex gap-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by ticker, name, or ISIN..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {searchTerm && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredAndSorted.length}</span> of{' '}
              <span className="font-semibold">{instruments.length}</span> instruments
            </div>

            <div className="space-y-4">
              {filteredAndSorted.map(instrument => (
                <InstrumentCard
                  key={instrument.ticker}
                  instrument={instrument}
                  isRecent={new Date(instrument.addedOn) > recentDate}
                />
              ))}
            </div>

            {filteredAndSorted.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg">No instruments found matching your criteria</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search term</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
