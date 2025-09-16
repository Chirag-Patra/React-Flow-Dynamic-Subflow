import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Activity,
  User,
  Cigarette,
  Wine,
  Heart,
  TrendingUp,
  Shield,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Settings
} from 'lucide-react';

// Import your actual AgentService
import AgentService from '../api/AgentService';

interface HealthMetric {
  id: string;
  label: string;
  value: string;
  status: "positive" | "negative" | "neutral" | "warning";
  icon: React.ReactNode;
  description: string;
  trend?: number;
}

interface PatientFormData {
  first_name: string;
  last_name: string;
  ssn: string;
  date_of_birth: string;
  gender: 'M' | 'F';
  zip_code: string;
}

interface EntityExtraction {
  diabetics?: string;
  age_group?: string;
  age?: number;
  smoking?: string;
  alcohol?: string;
  blood_pressure?: string;
  medical_conditions?: string[];
  medications_identified?: Array<{
    ndc: string;
    label_name: string;
    prescribing_provider?: string;
  }>;
}

interface HeartAttackPrediction {
  risk_category?: string;
  risk_display?: string;
  raw_risk_score?: number;
}

interface PatientData {
  first_name: string;
  last_name: string;
  calculated_age: number;
  gender: 'M' | 'F';
}

interface AnalysisResults {
  entity_extraction: EntityExtraction;
  heart_attack_prediction: HeartAttackPrediction;
  patient_data: PatientData;
}

const transformApiDataToMetrics = (entityExtraction: EntityExtraction, heartAttackPrediction: HeartAttackPrediction): HealthMetric[] => {
  const medicationCount = entityExtraction.medications_identified?.length || 0;
  const conditionCount = entityExtraction.medical_conditions?.length || 0;

  return [
    {
      id: "diabetes",
      label: "Diabetes Status",
      value: entityExtraction.diabetics?.toUpperCase() || "UNKNOWN",
      status: entityExtraction.diabetics === "no" ? "positive" : "warning",
      icon: <Activity className="h-5 w-5" />,
      description: entityExtraction.diabetics === "no" ? "No diabetes indicators detected" : "Diabetes condition identified",
      trend: entityExtraction.diabetics === "no" ? 0 : undefined,
    },
    {
      id: "age",
      label: "Age Group",
      value: `${entityExtraction.age_group?.toUpperCase() || "UNKNOWN"} (${entityExtraction.age || "N/A"})`,
      status: "neutral",
      icon: <User className="h-5 w-5" />,
      description: `${entityExtraction.age_group || "Unknown"} demographic classification, age ${entityExtraction.age || "N/A"}`,
    },
    {
      id: "smoking",
      label: "Smoking Status",
      value: entityExtraction.smoking?.toUpperCase() || "UNKNOWN",
      status: entityExtraction.smoking === "no" ? "positive" : "negative",
      icon: <Cigarette className="h-5 w-5" />,
      description: entityExtraction.smoking === "no" ? "Non-smoker profile confirmed" : "Smoking habit identified",
      trend: entityExtraction.smoking === "no" ? 0 : undefined,
    },
    {
      id: "alcohol",
      label: "Alcohol Consumption",
      value: entityExtraction.alcohol?.toUpperCase() || "UNKNOWN",
      status: entityExtraction.alcohol === "no" ? "positive" : "warning",
      icon: <Wine className="h-5 w-5" />,
      description: entityExtraction.alcohol === "no" ? "No alcohol consumption reported" : "Alcohol consumption reported",
      trend: entityExtraction.alcohol === "no" ? 0 : undefined,
    },
    {
      id: "blood_pressure",
      label: "Blood Pressure",
      value: entityExtraction.blood_pressure?.toUpperCase() || "UNKNOWN",
      status: entityExtraction.blood_pressure === "diagnosed" ? "warning" : "positive",
      icon: <Heart className="h-5 w-5" />,
      description: entityExtraction.blood_pressure === "diagnosed" ? "Hypertension under medical supervision" : "Normal blood pressure",
      trend: entityExtraction.blood_pressure === "diagnosed" ? -5 : 0,
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
      value: heartAttackPrediction?.risk_category?.toUpperCase() || "CALCULATING",
      status: heartAttackPrediction?.risk_category === "Low Risk" ? "positive" : "warning",
      icon: <Heart className="h-5 w-5" />,
      description: heartAttackPrediction?.risk_display || "Heart disease risk assessment",
      trend: heartAttackPrediction?.raw_risk_score ? Math.round((1 - heartAttackPrediction.raw_risk_score) * 100) - 50 : 0,
    }
  ];
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "positive":
      return "bg-green-100 text-green-700 border-green-200";
    case "negative":
      return "bg-red-100 text-red-700 border-red-200";
    case "warning":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "positive":
      return <Shield className="h-3 w-3" />;
    case "warning":
      return <AlertTriangle className="h-3 w-3" />;
    default:
      return null;
  }
};

export default function HealthAnalyticsDashboard() {
  const [analysisData, setAnalysisData] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState<PatientFormData>({
    first_name: "",
    last_name: "",
    ssn: "",
    date_of_birth: "",
    gender: "F",
    zip_code: ""
  });

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const runAnalysis = async () => {
    // Validate required fields
    if (!formData.first_name || !formData.last_name || !formData.ssn ||
        !formData.date_of_birth || !formData.zip_code) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await AgentService.runAnalysisSync(formData);

      if (result.success && result.data?.analysis_results) {
        setAnalysisData(result.data.analysis_results);
        setShowForm(false);
      } else {
        setError(result.errors?.[0]?.msg || "Analysis failed");
      }
    } catch (err) {
      setError("Failed to connect to analysis service");
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAnalysisData(null);
    setShowForm(true);
    setError(null);
    setFormData({
      first_name: "",
      last_name: "",
      ssn: "",
      date_of_birth: "",
      gender: "F",
      zip_code: ""
    });
  };

  const healthMetrics = analysisData?.entity_extraction ?
    transformApiDataToMetrics(
      analysisData.entity_extraction,
      analysisData.heart_attack_prediction
    ) : [];

  const getRiskLevel = () => {
    if (!analysisData?.entity_extraction) return { level: "Unknown", color: "bg-gray-500 text-white" };

    const data = analysisData.entity_extraction;
    const riskFactors = [
      data.diabetics !== "no",
      data.smoking !== "no",
      data.alcohol !== "no",
      data.blood_pressure === "diagnosed",
    ].filter(Boolean).length;

    if (riskFactors === 0) return { level: "Low Risk", color: "bg-green-600 text-white hover:bg-green-700" };
    if (riskFactors <= 2) return { level: "Moderate Risk", color: "bg-yellow-600 text-white hover:bg-yellow-700" };
    return { level: "High Risk", color: "bg-red-600 text-white hover:bg-red-700" };
  };

  const riskAssessment = getRiskLevel();

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Health Analytics Dashboard</h1>
              <p className="text-gray-600 text-lg">Real-time Patient Analysis & Risk Assessment</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            {showForm ? (
              <Button
                onClick={runAnalysis}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Analysis
                  </>
                )}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={runAnalysis}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Re-analyzing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Re-run Analysis
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  New Patient
                </Button>
              </div>
            )}

            {analysisData && (
              <Badge className={riskAssessment.color}>
                Overall Risk: {riskAssessment.level}
              </Badge>
            )}
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

      {/* Patient Input Form */}
      {showForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ssn">SSN *</Label>
                <Input
                  id="ssn"
                  value={formData.ssn}
                  onChange={(e) => handleInputChange('ssn', e.target.value)}
                  placeholder="123456789"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value: 'M' | 'F') => handleInputChange('gender', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="M">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="zip_code">ZIP Code *</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  placeholder="12345"
                  className="mt-1"
                />
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700">
                Error: {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && !showForm && (
        <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-red-700">
          Error: {error}
        </div>
      )}

      {/* Patient Info */}
      {analysisData?.patient_data && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">
                  {analysisData.patient_data.first_name} {analysisData.patient_data.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-medium">{analysisData.patient_data.calculated_age} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium">{analysisData.patient_data.gender === 'F' ? 'Female' : 'Male'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Risk Score</p>
                <p className="font-medium">
                  {analysisData.heart_attack_prediction?.raw_risk_score ?
                    `${Math.round(analysisData.heart_attack_prediction.raw_risk_score * 100)}%` :
                    'Calculating...'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Grid */}
      {healthMetrics.length > 0 && (
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
      )}

      {/* Medications & Conditions */}
      {analysisData?.entity_extraction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Current Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisData.entity_extraction.medications_identified?.length ? (
                <div className="space-y-3">
                  {analysisData.entity_extraction.medications_identified.slice(0, 5).map((med, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{med.label_name}</p>
                        <p className="text-xs text-gray-600">NDC: {med.ndc}</p>
                        {med.prescribing_provider && (
                          <p className="text-xs text-gray-500">Provider: {med.prescribing_provider}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {analysisData.entity_extraction.medications_identified.length > 5 && (
                    <p className="text-sm text-gray-600">
                      +{analysisData.entity_extraction.medications_identified.length - 5} more medications
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
                Medical Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysisData.entity_extraction.medical_conditions?.length ? (
                <div className="space-y-2">
                  {analysisData.entity_extraction.medical_conditions.map((condition, index) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800">{condition}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No medical conditions identified</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!analysisData && !loading && (
        <div className="text-center py-12">
          <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Ready for Analysis</h3>
          <p className="text-gray-500">Click "Run Analysis" to begin processing patient data</p>
        </div>
      )}
    </div>
  );
}