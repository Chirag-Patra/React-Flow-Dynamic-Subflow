"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, User, Cigarette, Wine, Heart, TrendingUp, Shield, AlertTriangle } from "lucide-react"

interface HealthMetric {
    id: string
    label: string
    value: string
    status: "positive" | "negative" | "neutral" | "warning"
    icon: React.ReactNode
    description: string
    trend?: number
}

interface AnalysisResult {
    entities: { type: string; value: string }[]
    heartRisk: {
        score: number
        level: string
    }
    medicationData: Array<{
        code: string
        meaning: string
        provider: string
    }>
    icd10Data: Array<{
        code: string
        meaning: string
    }>
}

interface HealthAnalyticsDashboardProps {
    result: AnalysisResult
}

const transformApiDataToMetrics = (entities: { type: string; value: string }[], heartRisk: { score: number; level: string }, medicationCount: number, conditionCount: number): HealthMetric[] => {
    // Create a map for easy lookup
    const entityMap = entities.reduce((map, entity) => {
        const key = entity.type.toLowerCase().replace(/\s+/g, '_');
        map[key] = entity.value;
        return map;
    }, {} as Record<string, string>);

    // Extract age from entities (assuming it might be in a different format)
    const ageValue = entityMap['age'] || entityMap['age_group'] || 'Unknown';
    const ageNumber = parseInt(ageValue.match(/\d+/)?.[0] || '0');

    return [
        {
            id: "diabetes",
            label: "Diabetes Status",
            value: (entityMap["diabetes_status"] || entityMap["diabetes"] || "Unknown").toUpperCase(),
            status: (entityMap["diabetes_status"] || entityMap["diabetes"])?.toLowerCase() === "no" ? "positive" : "warning",
            icon: <Activity className="h-5 w-5" />,
            description: (entityMap["diabetes_status"] || entityMap["diabetes"])?.toLowerCase() === "no" ? "No diabetes indicators detected" : "Diabetes condition identified",
            trend: (entityMap["diabetes_status"] || entityMap["diabetes"])?.toLowerCase() === "no" ? 0 : undefined,
        },
        {
            id: "age",
            label: "Age Group",
            value: ageValue.toUpperCase(),
            status: "neutral",
            icon: <User className="h-5 w-5" />,
            description: `${entityMap["age_group"] || "Unknown"} demographic classification${ageNumber ? `, age ${ageNumber}` : ''}`,
        },
        {
            id: "smoking",
            label: "Smoking Status",
            value: (entityMap["smoking_status"] || entityMap["smoking"] || "Unknown").toUpperCase(),
            status: (entityMap["smoking_status"] || entityMap["smoking"])?.toLowerCase() === "no" ? "positive" : "negative",
            icon: <Cigarette className="h-5 w-5" />,
            description: (entityMap["smoking_status"] || entityMap["smoking"])?.toLowerCase() === "no" ? "Non-smoker profile confirmed" : "Smoking habit identified",
            trend: (entityMap["smoking_status"] || entityMap["smoking"])?.toLowerCase() === "no" ? 0 : undefined,
        },
        {
            id: "alcohol",
            label: "Alcohol Consumption",
            value: (entityMap["alcohol_use"] || entityMap["alcohol"] || "Unknown").toUpperCase(),
            status: (entityMap["alcohol_use"] || entityMap["alcohol"])?.toLowerCase() === "no" ? "positive" : "warning",
            icon: <Wine className="h-5 w-5" />,
            description: (entityMap["alcohol_use"] || entityMap["alcohol"])?.toLowerCase() === "no" ? "No alcohol consumption reported" : "Alcohol consumption reported",
            trend: (entityMap["alcohol_use"] || entityMap["alcohol"])?.toLowerCase() === "no" ? 0 : undefined,
        },
        {
            id: "blood_pressure",
            label: "Blood Pressure",
            value: (entityMap["blood_pressure"] || "Unknown").toUpperCase(),
            status: entityMap["blood_pressure"]?.toLowerCase() === "diagnosed" ? "warning" : "positive",
            icon: <Heart className="h-5 w-5" />,
            description: entityMap["blood_pressure"]?.toLowerCase() === "diagnosed" ? "Hypertension under medical supervision" : "Normal blood pressure",
            trend: entityMap["blood_pressure"]?.toLowerCase() === "diagnosed" ? -5 : 0,
        },
        {
            id: "medications",
            label: "Active Medications",
            value: `${medicationCount} MEDICATIONS`,
            status: medicationCount > 0 ? "neutral" : "positive",
            icon: <Activity className="h-5 w-5" />,
            description: `Currently taking ${medicationCount} prescribed medications`,
        },
        {
            id: "conditions",
            label: "Medical Conditions",
            value: `${conditionCount} CONDITIONS`,
            status: conditionCount > 0 ? "warning" : "positive",
            icon: <AlertTriangle className="h-5 w-5" />,
            description: `${conditionCount} documented medical conditions`,
        },
        {
            id: "heart_risk",
            label: "Heart Disease Risk",
            value: heartRisk.level.toUpperCase() || "CALCULATING",
            status: heartRisk.level === "Low Risk" ? "positive" : "warning",
            icon: <Heart className="h-5 w-5" />,
            description: `Heart disease risk: ${heartRisk.score}% - ${heartRisk.level}`,
            trend: heartRisk.score ? Math.round((100 - heartRisk.score) / 2) - 25 : 0,
        }
    ]
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "positive":
            return "bg-green-100 text-green-700 border-green-200"
        case "negative":
            return "bg-red-100 text-red-700 border-red-200"
        case "warning":
            return "bg-yellow-100 text-yellow-700 border-yellow-200"
        default:
            return "bg-gray-100 text-gray-700 border-gray-200"
    }
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case "positive":
            return <Shield className="h-3 w-3" />
        case "warning":
            return <AlertTriangle className="h-3 w-3" />
        default:
            return null
    }
}

export function HealthAnalyticsDashboard({ result }: HealthAnalyticsDashboardProps) {
    const medicationCount = result.medicationData?.length || 0;
    const conditionCount = result.icd10Data?.length || 0;

    const healthMetrics = transformApiDataToMetrics(
        result.entities,
        result.heartRisk,
        medicationCount,
        conditionCount
    );

    const getRiskLevel = () => {
        // Create entity map for risk calculation
        const entityMap = result.entities.reduce((map, entity) => {
            const key = entity.type.toLowerCase().replace(/\s+/g, '_');
            map[key] = entity.value.toLowerCase();
            return map;
        }, {} as Record<string, string>);

        const riskFactors = [
            entityMap["diabetes_status"] !== "no" && entityMap["diabetes"] !== "no",
            entityMap["smoking_status"] !== "no" && entityMap["smoking"] !== "no",
            entityMap["alcohol_use"] !== "no" && entityMap["alcohol"] !== "no",
            entityMap["blood_pressure"] === "diagnosed",
        ].filter(Boolean).length;

        if (riskFactors === 0) return { level: "Low Risk", color: "bg-green-600 text-white hover:bg-green-700" };
        if (riskFactors <= 2) return { level: "Moderate Risk", color: "bg-yellow-600 text-white hover:bg-yellow-700" };
        return { level: "High Risk", color: "bg-red-600 text-white hover:bg-red-700" };
    };

    const riskAssessment = getRiskLevel();

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 p-8">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-100">
                            <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Entity Extraction & Health Analytics</h1>
                            <p className="text-gray-600 text-lg">Comprehensive Health Risk Assessment</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                        <Badge className={riskAssessment.color}>
                            Overall Risk: {riskAssessment.level}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-700">
                            Heart Risk: {result.heartRisk.score}%
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Real-time Analysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">HIPAA Compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">ML-Powered Insights</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {healthMetrics.map((metric) => (
                    <Card
                        key={metric.id}
                        className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                    >
                        <CardHeader className="pb-2 px-4 pt-4">
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    {metric.icon}
                                </div>
                                {getStatusIcon(metric.status) && (
                                    <div className={`p-1 rounded-full ${getStatusColor(metric.status)}`}>
                                        {getStatusIcon(metric.status)}
                                    </div>
                                )}
                            </div>
                            <CardTitle className="text-xs font-medium text-gray-600 truncate">{metric.label}</CardTitle>
                        </CardHeader>

                        <CardContent className="pt-0 px-4 pb-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold truncate">{metric.value}</span>
                                    {metric.trend !== undefined && (
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${
                                                metric.trend > 0 ? "text-green-600" :
                                                metric.trend < 0 ? "text-yellow-600" : "text-gray-600"
                                            }`}
                                        >
                                            {metric.trend > 0 ? "+" : ""}
                                            {metric.trend}%
                                        </Badge>
                                    )}
                                </div>

                                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{metric.description}</p>

                                {metric.status === "warning" && <Progress value={75} className="h-1" />}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Additional Data Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Medications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Current Medications ({medicationCount})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {result.medicationData?.length ? (
                            <div className="space-y-3">
                                {result.medicationData.slice(0, 5).map((med, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-sm">{med.meaning}</p>
                                            <p className="text-xs text-gray-600">NDC: {med.code}</p>
                                            {med.provider && (
                                                <p className="text-xs text-gray-500">Provider: {med.provider}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {result.medicationData.length > 5 && (
                                    <p className="text-sm text-gray-600">
                                        +{result.medicationData.length - 5} more medications
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-600">No medications identified</p>
                        )}
                    </CardContent>
                </Card>

                {/* Medical Conditions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Medical Conditions ({conditionCount})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {result.icd10Data?.length ? (
                            <div className="space-y-2">
                                {result.icd10Data.slice(0, 5).map((condition, index) => (
                                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm font-medium text-yellow-800">
                                            {condition.code}: {condition.meaning || 'Unknown condition'}
                                        </p>
                                    </div>
                                ))}
                                {result.icd10Data.length > 5 && (
                                    <p className="text-sm text-gray-600">
                                        +{result.icd10Data.length - 5} more conditions
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-600">No medical conditions identified</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Heart Risk Detail */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Heart Disease Risk Assessment
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">{result.heartRisk.score}%</p>
                            <p className="text-sm text-gray-600">Risk Score</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className={`text-lg font-semibold ${
                                result.heartRisk.level === 'Low Risk' ? 'text-green-600' :
                                result.heartRisk.level === 'Medium Risk' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                                {result.heartRisk.level}
                            </p>
                            <p className="text-sm text-gray-600">Risk Category</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <Progress
                                value={result.heartRisk.score}
                                className="h-2 mb-2"
                            />
                            <p className="text-sm text-gray-600">Risk Visualization</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}