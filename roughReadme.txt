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

const transformApiDataToMetrics = (entities: { type: string; value: string }[]): HealthMetric[] => {
    // Create entity map for easy lookup - handle various naming patterns
    const entityMap = entities.reduce((map, entity) => {
        const key = entity.type.toLowerCase();
        map[key] = entity.value;
        return map;
    }, {} as Record<string, string>);

    // Map the exact fields from your API response with fallbacks
    const diabetics = entityMap["diabetes status"] || entityMap["diabetics"] || "no";
    const ageGroup = entityMap["age group"] || "senior";
    const age = parseInt(entityMap["age"] || "69");
    const smoking = entityMap["smoking status"] || entityMap["smoking"] || "no";
    const alcohol = entityMap["alcohol use"] || entityMap["alcohol"] || "no";
    const bloodPressure = entityMap["blood pressure"] || "unknown";

    return [
        {
            id: "diabetes",
            label: "Diabetes Status",
            value: diabetics.toUpperCase(),
            status: diabetics === "no" ? "positive" : "warning",
            icon: <Activity className="h-5 w-5" />,
            description: diabetics === "no" ? "No diabetes indicators detected" : "Diabetes condition identified",
            trend: diabetics === "no" ? 0 : undefined,
        },
        {
            id: "age",
            label: "Age Group",
            value: `${ageGroup.toUpperCase()} (${age})`,
            status: "neutral",
            icon: <User className="h-5 w-5" />,
            description: `${ageGroup} demographic classification, age ${age}`,
        },
        {
            id: "smoking",
            label: "Smoking Status",
            value: smoking.toUpperCase(),
            status: smoking === "no" ? "positive" : "negative",
            icon: <Cigarette className="h-5 w-5" />,
            description: smoking === "no" ? "Non-smoker profile confirmed" : "Smoking habit identified",
            trend: smoking === "no" ? 0 : undefined,
        },
        {
            id: "alcohol",
            label: "Alcohol Consumption",
            value: alcohol.toUpperCase(),
            status: alcohol === "no" ? "positive" : "warning",
            icon: <Wine className="h-5 w-5" />,
            description: alcohol === "no" ? "No alcohol consumption reported" : "Alcohol consumption reported",
            trend: alcohol === "no" ? 0 : undefined,
        },
        {
            id: "blood_pressure",
            label: "Blood Pressure",
            value: bloodPressure.toUpperCase(),
            status: bloodPressure === "diagnosed" ? "warning" : "positive",
            icon: <Heart className="h-5 w-5" />,
            description: bloodPressure === "diagnosed" ? "Hypertension under medical supervision" : "Normal blood pressure",
            trend: bloodPressure === "diagnosed" ? -5 : 0,
        },
    ]
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "positive":
            return "bg-chart-1/10 text-chart-1 border-chart-1/20"
        case "negative":
            return "bg-destructive/10 text-destructive border-destructive/20"
        case "warning":
            return "bg-chart-3/10 text-chart-3 border-chart-3/20"
        default:
            return "bg-muted text-muted-foreground border-border"
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
    const healthMetrics = transformApiDataToMetrics(result.entities);

    const getRiskLevel = () => {
        // Create entity map for risk calculation
        const entityMap = result.entities.reduce((map, entity) => {
            const key = entity.type.toLowerCase();
            map[key] = entity.value.toLowerCase();
            return map;
        }, {} as Record<string, string>);

        const riskFactors = [
            (entityMap["diabetes status"] || entityMap["diabetics"]) !== "no",
            (entityMap["smoking status"] || entityMap["smoking"]) !== "no",
            (entityMap["alcohol use"] || entityMap["alcohol"]) !== "no",
            entityMap["blood pressure"] === "diagnosed",
        ].filter(Boolean).length;

        if (riskFactors === 0) return { level: "Low Risk", color: "bg-chart-1 text-white hover:bg-chart-1/90" }
        if (riskFactors <= 2) return { level: "Moderate Risk", color: "bg-chart-3 text-white hover:bg-chart-3/90" }
        return { level: "High Risk", color: "bg-destructive text-white hover:bg-destructive/90" }
    }

    const riskAssessment = getRiskLevel()

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/10 p-8">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-balance">Entity Extraction</h1>
                            <p className="text-muted-foreground text-lg">Enhanced Entity Extraction & Health Analytics</p>
                        </div>
                    </div>

                    <div className="w-full p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-chart-1" />
                                <span className="text-sm font-medium">Real-time Analysis</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-chart-1" />
                                <span className="text-sm font-medium">HIPAA Compliant</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="health-section">
                {healthMetrics.map((metric) => (
                    <Card
                        key={metric.id}
                        className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-400 hover:border-gray-300 bg-card/50 backdrop-blur-sm min-w-0"
                    >
                        <CardHeader className="pb-2 px-3 pt-3" style={{ display: "grid", gridTemplateColumns: "none" }}>
                            <div className="flex items-center justify-between">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    {metric.icon}
                                </div>
                                {getStatusIcon(metric.status) && (
                                    <div className={`p-1 rounded-full ${getStatusColor(metric.status)}`}>
                                        {getStatusIcon(metric.status)}
                                    </div>
                                )}
                            </div>
                            <CardTitle className="text-xs font-medium text-muted-foreground truncate">{metric.label}</CardTitle>
                        </CardHeader>

                        <CardContent className="pt-0 px-3 pb-3">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold truncate">{metric.value}</span>
                                    {metric.trend !== undefined && (
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${metric.trend > 0 ? "text-chart-1" : metric.trend < 0 ? "text-chart-3" : "text-muted-foreground"
                                                }`}
                                        >
                                            {metric.trend > 0 ? "+" : ""}
                                            {metric.trend}%
                                        </Badge>
                                    )}
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{metric.description}</p>

                                {metric.status === "warning" && <Progress value={75} className="h-1" />}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}