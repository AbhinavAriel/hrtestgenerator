import { useState, FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { createApplicant, ApplicantResponse } from "../api/applicantApi"
import { useTest } from "../context/TestContext"
import { ApplicantForm, FormErrors, Applicant } from "../types/user"

export function useUserDetails() {

    const navigate = useNavigate()
    const { setUser } = useTest()

    const [form, setForm] = useState<ApplicantForm>({
        name: "",
        email: "",
        phone: ""
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [apiError, setApiError] = useState<string>("")
    const [submitting, setSubmitting] = useState(false)

    const validate = () => {

        const newErrors: FormErrors = {}

        if (!form.name.trim()) {
            newErrors.name = "Full name is required"
        }

        if (!form.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
            newErrors.email = "Enter a valid email address"
        }

        if (!form.phone.trim()) {
            newErrors.phone = "Phone number is required"
        } else if (!/^[0-9]{10}$/.test(form.phone.trim())) {
            newErrors.phone = "Enter a valid 10-digit phone number"
        }

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }

    const onChangeField = (key: keyof ApplicantForm, value: string) => {

        setForm((p) => ({ ...p, [key]: value }))

        setApiError("")

        setErrors((p) => {
            const copy = { ...p }
            delete copy[key]
            return copy
        })
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {

        e.preventDefault()

        if (submitting) return

        setApiError("")

        if (!validate()) return

        try {

            setSubmitting(true)

            const result: ApplicantResponse = await createApplicant({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim()
            })
            const resolvedId = result.id || result.userId || result.userID

            if (!resolvedId) {
                throw new Error("Registration succeeded but user id not returned.")
            }

            const normalizedUser: Applicant = {
                id:    resolvedId,
                name:  result.fullName,
                email: result.email,
                phone: result.phoneNumber,
            }

            setUser(normalizedUser)

            navigate("/policy", { replace: true })

        } catch (error: unknown) {

            if (error instanceof Error) {
                setApiError(error.message)
            } else {
                setApiError("Something went wrong while registering")
            }

        } finally {

            setSubmitting(false)

        }
    }

    return {
        form,
        errors,
        apiError,
        submitting,
        onChangeField,
        handleSubmit
    }
}