import { InfoIcon, ChevronDown, Loader, Loader2, AlertCircle } from "lucide-react";
import React, { useState } from "react";

export interface IFormData {
  submissionJson: object | null;
  submissionId: string;
  walletAddress: string;
  quality: 'S' | 'A' | 'B' | 'C' | 'D' | '';
}

interface FormProps {
  onSubmit: (formData: IFormData) => Promise<void>;
}

interface ValidationErrors {
  submissionJson?: string;
  submissionId?: string;
  walletAddress?: string;
  quality?: string;
}

interface FormState {
  submissionJsonString: string;
  submissionId: string;
  walletAddress: string;
  quality: 'S' | 'A' | 'B' | 'C' | 'D' | '';
}

const Form: React.FC<FormProps> = ({ onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [formState, setFormState] = useState<FormState>({
    submissionJsonString: "",
    submissionId: "",
    walletAddress: "",
    quality: "",
  });

  const isValidJSON = (jsonString: string): boolean => {
    if (!jsonString.trim()) return true;
    try {
      const parsed = JSON.parse(jsonString);
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  };

  const handleJsonChange = (value: string) => {
    handleInputChange("submissionJsonString", value);
    if (!value.trim()) {
      setJsonError(null);
      return;
    }
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null) {
        setJsonError(null);
      } else {
        setJsonError("Must be a JSON object");
      }
    } catch {
      setJsonError("Invalid JSON");
    }
  };

  const isValidWalletAddress = (address: string): boolean => {
    if (!address.trim()) return true;
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const isValidSubmissionId = (id: string): boolean => {
    return id.trim().length > 0;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (formState.submissionJsonString.trim() && !isValidJSON(formState.submissionJsonString)) {
      newErrors.submissionJson = "Please enter a valid JSON format";
    }

    if (!isValidSubmissionId(formState.submissionId)) {
      newErrors.submissionId = "Submission ID is required";
    }

    if (formState.walletAddress.trim() && !isValidWalletAddress(formState.walletAddress)) {
      newErrors.walletAddress = "Please enter a valid wallet address (0x format)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [field as keyof ValidationErrors]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const formData: IFormData = {
        submissionJson: formState.submissionJsonString.trim() 
          ? JSON.parse(formState.submissionJsonString) 
          : null,
        submissionId: formState.submissionId,
        walletAddress: formState.walletAddress,
        quality: formState.quality,
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-white font-bold">
              Submission JSON
            </label>
            <a
              href="#"
              className="text-[#875DFF] underline text-sm transition-colors"
            >
              JSON Assembly Tutorial
            </a>
          </div>
          <div className="relative">
            <textarea
              required
              value={formState.submissionJsonString}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder="Paste the original submission JSON."
              className={`w-full h-32 px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent resize-none block ${
                errors.submissionJson 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-white/10'
              }`}
            />
            {jsonError && (
              <div className="absolute bottom-2 right-2 text-xs text-red-400">{jsonError}</div>
            )}
            {formState.submissionJsonString && !jsonError && (
              <div className="absolute bottom-2 right-2 text-xs text-green-400">✓ Valid JSON</div>
            )}
          </div>
          {errors.submissionJson && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{errors.submissionJson}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-white font-bold">
              Submission ID *
            </label>
            <a
              href="#"
              className="text-[#875DFF] underline text-sm transition-colors"
            >
              Explorer Tutorial (Step 2.1)
            </a>
          </div>
          <input
            required
            type="text"
            value={formState.submissionId}
            onChange={(e) => handleInputChange("submissionId", e.target.value)}
            placeholder="e.g. 2025082903351000xxxxxx"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent ${
              errors.submissionId 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-white/10'
            }`}
          />
          {errors.submissionId && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{errors.submissionId}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-white font-bold block">
            WALLET address
          </label>
          <input
            required
            type="text"
            value={formState.walletAddress}
            onChange={(e) => handleInputChange("walletAddress", e.target.value)}
            placeholder="Enter WALLET address (0x...)"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent ${
              errors.walletAddress 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-white/10'
            }`}
          />
          {errors.walletAddress && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{errors.walletAddress}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-white font-bold">
              Quality *
            </label>
            <div className="relative group flex items-center text-white/50 gap-1 font-light">
              <InfoIcon size={14}></InfoIcon>
              <span className="text-sm">
                If not sure, try all four options one by one until one matches.
              </span>
            </div>
          </div>
          <div className="relative">
            <select
              value={formState.quality}
              onChange={(e) => handleInputChange("quality", e.target.value)}
              className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">No Ranking</option>
              <option value="S">S</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/60">
              <ChevronDown></ChevronDown>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-[#875DFF] hover:bg-[#7A4FE6] cursor-pointer rounded-full text-white font-medium py-3 px-6 duration-200 transition-all disabled:opacity-50 flex items-center justify-center"
            disabled={isLoading}
          >
            { isLoading ? <Loader2 className="animate-spin"></Loader2> : "Verify Fingerprint"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;