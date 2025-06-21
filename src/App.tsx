import React, { useState } from 'react';
import { Maximize2, Minimize2, X, Calendar, Newspaper, Archive } from 'lucide-react';

function App() {
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 to-teal-800 p-4">
      <div className={`mx-auto bg-gray-200 border-2 border-gray-400 shadow-2xl transition-all duration-300 ${
        isMaximized ? 'w-full h-screen' : 'max-w-6xl'
      }`}>
        {/* Window Title Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 flex items-center justify-between border-b-2 border-gray-400">
          <div className="flex items-center space-x-2">
            <Newspaper size={16} />
            <span className="font-bold text-sm">Yesterday's Paper</span>
          </div>
          <div className="flex items-center space-x-1">
            <button className="w-6 h-6 bg-gray-300 border border-gray-500 hover:bg-gray-400 flex items-center justify-center">
              <Minimize2 size={12} className="text-black" />
            </button>
            <button 
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-6 h-6 bg-gray-300 border border-gray-500 hover:bg-gray-400 flex items-center justify-center"
            >
              <Maximize2 size={12} className="text-black" />
            </button>
            <button className="w-6 h-6 bg-gray-300 border border-gray-500 hover:bg-red-400 flex items-center justify-center">
              <X size={12} className="text-black" />
            </button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="bg-gray-100 border-b border-gray-300 px-4 py-1 flex items-center space-x-6 text-sm">
          <button className="hover:bg-gray-200 px-2 py-1 border border-gray-400 bg-white font-bold">
            "All the News That's Fit!"
          </button>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Calendar size={12} />
            <span>On-Line Edition</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 bg-white min-h-96">
          {/* Newspaper Header */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-5xl font-serif font-bold text-gray-900 tracking-tight mb-2">
              The Twin Hill Times
            </h1>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Copyright 1995, Twin Hill Times Corporation</span>
              <span>NOVEMBER 11, 1995</span>
            </div>
          </div>

          {/* Main Articles Grid - Now 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-4">
              <div className="border-b border-gray-300 pb-6 mb-6">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3 leading-tight">
                  Coffee Plant Fire Costs Millions
                </h2>
                <p className="text-sm text-gray-600 mb-3 font-semibold">
                  By Virginia Deeger Malamud
                </p>
                <div className="text-sm leading-relaxed text-gray-800 space-y-3">
                  <p>
                    <strong>Twin Hills, Wa.</strong> — A warehouse fire alarm has destroyed the Twin Hills coffee manufacturing Roasting Room yesterday evening at the Main Street facility.
                  </p>
                  <p>
                    The blaze, which started at approximately 11:30pm according to Fire Chief Harold Baxon Lodge, resulted in damage estimated during this disaster.
                  </p>
                  <p>
                    Damage to the plant and inventory of over three tons of raw coffee beans is expected to total several million dollars, according to Fire Department estimates.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">
                  Investigation Continues
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  The scene of the fire remains under investigation, though Deputy Fire Chief Marshall of the Twin Hills Fire Department say work is expected to continue.
                </p>
              </div>
            </div>

            {/* Center Column with Photo */}
            <div className="lg:col-span-4">
              <div className="text-center mb-6">
                <div className="border-2 border-gray-800 p-2 bg-white">
                  <img 
                    src="https://images.pexels.com/photos/266487/pexels-photo-266487.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
                    alt="Fire at the Twin Hills Coffee Plant"
                    className="w-full h-48 object-cover grayscale"
                  />
                  <div className="bg-gray-100 p-2 mt-2 border-t border-gray-400">
                    <p className="text-xs font-bold text-gray-900 mb-1">
                      DEVASTATING BLAZE
                    </p>
                    <p className="text-xs text-gray-700 leading-tight">
                      Firefighters battle the flames that engulfed the Twin Hills Coffee Corporation's main roasting facility late Friday evening. The fire caused extensive damage to the building and destroyed thousands of pounds of coffee beans.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">
                    Employee Safety Priority
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    All employees of the Twin Hills roaster were safely evacuated according to the latest reports about their safety protocols. No injuries were reported.
                  </p>
                </div>

                <div className="border border-gray-300 p-3 bg-gray-50">
                  <h4 className="font-serif font-bold text-gray-900 mb-2 text-sm">
                    Fire Department Response
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    "It's truly one of the worst fires we've had in Twin Hills," said Fire Chief Harold Baxon Lodge. "Our crews worked through the night to contain the blaze."
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="border-2 border-gray-400 p-4 bg-gray-50">
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-3">
                  Workers Being Moved to Other Plants
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  <strong>Twin Hills, Wa.</strong> — Due to the impact on current orders, the Twin Hills Coffee Corporation is temporarily relocating employees from the Twin Hills warehouse to other facilities.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  The company anticipates sending most of the Twin Hills workers to the White Whale Mill, with smaller numbers going to the Clearpoint Hills and Columbia facilities.
                </p>
              </div>

              <div className="border border-gray-300 p-4">
                <h4 className="font-serif font-bold text-gray-900 mb-2">
                  Production Impact
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Company officials said production capacity will be reduced by approximately 55% until the Main Street facilities are restored.
                </p>
              </div>

              <div className="border border-gray-300 p-4">
                <h4 className="font-serif font-bold text-gray-900 mb-2">
                  Market Response
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Much of the market coffee was sold to overseas markets, according to the company. The Twin Hills Vice President of Sales reported continued demand despite the setback.
                </p>
              </div>

              <div className="border border-gray-300 p-4 bg-yellow-50">
                <h4 className="font-serif font-bold text-gray-900 mb-2">
                  Community Support
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Local businesses have offered assistance to displaced workers. The Twin Hills Chamber of Commerce is coordinating relief efforts.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between items-center">
            <button className="px-4 py-2 bg-gray-200 border border-gray-400 hover:bg-gray-300 text-sm font-bold">
              Continue...
            </button>
            <div className="flex items-center space-x-2">
              <Archive size={16} className="text-gray-600" />
              <span className="text-sm text-gray-600">Historical Archives Available</span>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-gray-200 border-t border-gray-400 px-4 py-1 flex justify-between items-center text-xs text-gray-600">
          <span>Ready</span>
          <div className="flex items-center space-x-4">
            <span>Page 1 of 1</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;