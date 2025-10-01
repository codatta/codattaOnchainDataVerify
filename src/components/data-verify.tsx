import { useState, useEffect, useMemo } from 'react'
import { contract as onchainDataContract } from '../contracts/onchain-data.abi'
import { createPublicClient, http } from 'viem'
import DoubleCheckSVG from '../assets/images/check-double-fill.svg'
import LoaderSVG from '../assets/images/loader-line.svg'
import CloseSVG from '../assets/images/close-line.svg'
import { IFormData } from './form'
import api from '../apis/verification.api'

function StepCalculatingFingerprint({
  verifyData,
  onComplete
}: {
  verifyData: IFormData
  onComplete: (fingerprint: string) => void
}) {
  const [loading, setLoading] = useState(true)
  const [fingerprint, setFingerprint] = useState('')

  async function getFingerprint(verifyData: IFormData) {
    setLoading(true)
    try {
      const res = await api.generateFingerprint({
        submit_data: verifyData.submissionJson,
        address: verifyData.walletAddress,
        quality: verifyData.quality
      })
      const fingerprint = `0x${res.data.fingerprint}`
      setFingerprint(fingerprint)
      setTimeout(() => {
        onComplete(fingerprint)
      }, 300)
    } catch (err: any) {
      alert(err.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!verifyData) return
    getFingerprint(verifyData)
  }, [verifyData])

  return (
    <div className="flex gap-2 p-3">
      <div className="flex w-5 flex-col items-center pt-1">
        {loading ? (
          <img src={LoaderSVG} className="size-5 animate-spin" alt="" />
        ) : (
          <img src={DoubleCheckSVG} className="size-5 text-green-400" alt="" />
        )}
        <div className="relative top-2 h-[calc(100%-32px)] w-[1px] bg-white/10"></div>
      </div>
      <div className="flex-1">
        <h3 className="mb-2 text-lg font-bold leading-[28px] text-white">
          {loading ? 'Calculating local fingerprint...' : 'Complete the local fingerprint generation'}
        </h3>
        <p className="text-sm text-[#BBBBBE]">
          We hash your JSON + address + quality locally to calculate your unique fingerprint.
        </p>
        {!loading && (
          <div className="mt-4 rounded-lg bg-[#1a1a24] p-3">
            <p className="mb-1 text-xs text-gray-400">Fingerprint:</p>
            <p className="font-mono break-all text-xs text-[#BBBBBE]">{fingerprint}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StepReadOnChainFingerprint({
  verifyData,
  onComplete
}: {
  verifyData: IFormData
  onComplete: (fingerprint: string) => void
}) {
  const [loading, setLoading] = useState(true)
  const [fingerprint, setFingerprint] = useState('')

  async function getOnChainFingerprint(verifyData: IFormData) {
    setLoading(true)

    try {
      const client = createPublicClient({
        chain: onchainDataContract.chain,
        transport: http()
      })

      const userAddress = verifyData.walletAddress
      const submissionId = verifyData.submissionId

      const fingerprint = (await client.readContract({
        abi: onchainDataContract.abi,
        address: onchainDataContract.address as `0x${string}`,
        functionName: 'getUserRecordBySubmissionId',
        args: [userAddress, submissionId, 0, 100]
      })) as Array<object>
      const fingerprintOnChainData = fingerprint[1] as {
        fingerPrint: string
        submissionId: string
      }

      setFingerprint(fingerprintOnChainData.fingerPrint)
      setTimeout(() => {
        onComplete(fingerprintOnChainData.fingerPrint)
      }, 500)
    } catch (err: any) {
      alert(err.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!verifyData) return
    getOnChainFingerprint(verifyData)
  }, [verifyData])

  return (
    <div className="flex gap-2 p-3">
      <div className="flex w-5 flex-col items-center pt-1">
        {loading ? (
          <img src={LoaderSVG} className="size-5 animate-spin" alt="" />
        ) : (
          <img src={DoubleCheckSVG} className="size-5 text-green-400" alt="" />
        )}
        <div className="relative top-2 w-[1px] bg-white/10"></div>
      </div>
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-3">
          <h3 className="text-lg font-bold leading-[28px] text-white">
            {loading ? 'Reading on-chain fingerprint...' : 'Complete the on-chain fingerprint reading'}
          </h3>
        </div>
        <p className="mb-2 text-sm text-[#BBBBBE]">
          Fetch the attested fingerprint from chain. Read-only call — no writes, no gas.
        </p>
        {!loading && (
          <div className="mt-4 rounded-lg bg-[#1a1a24] p-3">
            <p className="mb-1 text-xs text-gray-400">Fingerprint:</p>
            <p className="font-mono break-all text-xs text-[#BBBBBE]">{fingerprint}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StepComparingFingerprints({
  onComplete,
  localFingerprint,
  onChainFingerprint
}: {
  onComplete: (result: boolean) => void
  localFingerprint: string
  onChainFingerprint: string
}) {
  const [loading] = useState(false)

  const result = useMemo(() => {
    return localFingerprint === onChainFingerprint
  }, [localFingerprint, onChainFingerprint])

  useEffect(() => {
    setTimeout(() => onComplete(result), 500)
  }, [result])

  return (
    <div className="flex gap-2 p-3">
      <div className="flex w-5 flex-col items-center pt-1">
        {loading ? (
          <img src={LoaderSVG} className="size-5 animate-spin" alt="" />
        ) : (
          <img src={DoubleCheckSVG} className="size-5 text-green-400" alt="" />
        )}
        <div className="relative top-2 h-[calc(100%-32px)] w-[1px] bg-white/10"></div>
      </div>
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-3">
          <h3 className="text-lg font-bold leading-[28px] text-white">
            {loading
              ? 'Comparing local fingerprint with on-chain fingerprint...'
              : 'Complete the fingerprint comparison'}
          </h3>
        </div>
        <p className="mb-2 text-sm text-[#BBBBBE]">
          Comparing the local and on-chain fingerprints means that the data has not been tampered with and can be
          self-verified.
        </p>
        <div className="mt-4 rounded-lg bg-[#1a1a24] p-3">
          {result == true ? (
            <div>
              <div className="flex items-center gap-2">
                <img src={DoubleCheckSVG} className="size-5 text-green-400" alt="" />
                <p className="text-base text-green-400">Verification successful</p>
              </div>
              <p className="text-sm text-[#BBBBBE]">
                your data matches the on-chain record (attested & tamper-proof).
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <img src={CloseSVG} className="size-5 text-[#D92B2B]" alt="" />
                <p className="text-base text-[#D92B2B]">Verification failed</p>
              </div>
              <p className="text-sm text-[#BBBBBE]">
                Make sure your JSON/address/quality match the original submission.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StepTaskResult(props: { result: boolean }) {
  const { result } = props

  return (
    <div className="flex gap-2 p-3">
      <div className="flex w-5 flex-col items-center pt-1">
        {result ? (
          <img src={DoubleCheckSVG} className="size-5 text-green-400" alt="" />
        ) : (
          <img src={CloseSVG} className="size-5 text-[#D92B2B]" alt="" />
        )}
        <div className="relative top-2 h-[calc(100%-32px)] w-[1px] bg-white/10"></div>
      </div>
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-3">
          <h3 className="text-lg font-bold leading-[28px] text-white">
            {result ? (
              <span className="text-[#5DDD22]">Completed</span>
            ) : (
              <span className="text-[#D92B2B]">Not completed</span>
            )}
          </h3>
        </div>
        <p className="mb-2 text-sm text-[#BBBBBE]">
          {result
            ? 'To receive your reward, please verify the task on the Binance Wallet campaign page.'
            : 'This verification does not meet the campaign completion criteria'}
        </p>
      </div>
    </div>
  )
}

// Main Component
export default function TaskDataVerify(props: { verifyData: IFormData | undefined }) {
  const { verifyData } = props
  const [currentStep, setCurrentStep] = useState(1)
  const [localFingerprint, setLocalFingerprint] = useState('')
  const [onChainFingerprint, setOnChainFingerprint] = useState('')
  const [verificationResult, setVerificationResult] = useState(false)

  const handleStepComplete = () => {
    setCurrentStep((prev) => prev + 1)
  }

  const handleLocalFingerprintComplete = (fingerprint: string) => {
    setLocalFingerprint(fingerprint)
    handleStepComplete()
  }

  const handleOnChainFingerprintComplete = (fingerprint: string) => {
    setOnChainFingerprint(fingerprint)
    handleStepComplete()
  }

  const handleVerificationComplete = (result: boolean) => {
    setVerificationResult(result)
    handleStepComplete()
  }

  useEffect(()=>{
    setCurrentStep(1)
  }, [verifyData])

  if (!verifyData) return <></>



  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="rounded-xl border border-white/5 bg-[#252532]">
        {currentStep >= 1 && (
          <StepCalculatingFingerprint
            verifyData={verifyData}
            onComplete={handleLocalFingerprintComplete}
          />
        )}
        {currentStep >= 2 && (
          <StepReadOnChainFingerprint verifyData={verifyData} onComplete={handleOnChainFingerprintComplete} />
        )}
        {currentStep >= 3 && (
          <StepComparingFingerprints
            onComplete={handleVerificationComplete}
            localFingerprint={localFingerprint}
            onChainFingerprint={onChainFingerprint}
          />
        )}
      </div>
    </div>
  )
}
