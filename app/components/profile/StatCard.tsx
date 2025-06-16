'use client'

import { IconType } from "react-icons"

interface StatCard {
    icon: IconType,
    label: string,
    value: number,
    color: string,
    onClick: () => void
}

    const StatCard = ({ icon: Icon, label, value, color, onClick }: StatCard) => (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow hover:cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    )

    export default StatCard