import React from "react";

const vision = () => {
    return (
        <div className="w-full h-full flex items-center justify-center p-3">
            <div className="border-2 border-gray-500 rounded-lg w-full p-8 md:w-1/2 flex flex-col gap-2">
                <h1 className="text-2xl mb-4 text-center">Project Vision</h1>
                <ul className="list-disc pl-3 space-y-2">
                    <li>Teaching is an extremely exhausting profession, yet it remains severely underpaid, leaving many students in NGOs and public schools without access to quality education.</li>
                    <li>AI is going to revolutionize the way our education system works, and it can help underprivileged students have access to better education.</li>
                    <li>This is a basic AI agent trained to teach English. Support for more subjects is to be added.</li>
                    <li>Keeping in mind the diversity in Indian languages, future updates need to support for all regional languages: Hindi, Marathi, Telugu etc...</li>
                </ul>
            </div>
        </div>
    );
}

export default vision