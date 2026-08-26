from app.utils.randomness_tests import frequency_test, entropy_test, chi_square_test
from app.services.quantum_service import generate_qubits, generate_real_quantum_bits
from app.services.classical_rng_service import generate_classical_bits
from app.utils.visualization import save_bit_distribution_plot, save_entropy_comparison_plot


def _to_bitstring(bits) -> str:
    """Normalise any bit source (string, tuple, or list) to a plain '0'/'1' string."""
    if isinstance(bits, tuple):
        bits = bits[0]
    if isinstance(bits, list):
        return "".join(str(b) for b in bits)
    return str(bits)


def run_randomness_analysis(bits):
    bits = _to_bitstring(bits)
    return {
        "frequency_test": frequency_test(bits),
        "entropy_test":   entropy_test(bits),
        "chi_square_test": chi_square_test(bits),
    }


def run_experiment(generator: str, sample_size: int):
    is_simulated_fallback = False
    if generator == "quantum":
        raw, is_simulated_fallback = generate_real_quantum_bits(sample_size)
    elif generator == "simulator":
        raw = generate_qubits(sample_size)
    else:
        raw = generate_classical_bits(sample_size)

    bits = _to_bitstring(raw)

    zeros = bits.count("0")
    ones  = bits.count("1")
    ent   = entropy_test(bits)
    chi   = chi_square_test(bits)

    # Returns a base64-encoded PNG string — no URLs, no env vars, works everywhere
    plot_b64 = save_bit_distribution_plot(zeros, ones)

    return {
        "generator":             generator,
        "sample_size":           sample_size,
        "zeros":                 zeros,
        "ones":                  ones,
        "entropy":               ent["entropy"],
        "chi_square":            chi["chi_square"],
        "distribution_plot":     plot_b64,
        "is_simulated_fallback": is_simulated_fallback,
    }


def compare_rng(sample_size: int):
    quantum_bits   = _to_bitstring(generate_qubits(sample_size))
    classical_bits = _to_bitstring(generate_classical_bits(sample_size))

    quantum_entropy   = entropy_test(quantum_bits)["entropy"]
    classical_entropy = entropy_test(classical_bits)["entropy"]

    # Returns a base64-encoded PNG string — no URLs, no env vars, works everywhere
    plot_b64 = save_entropy_comparison_plot(quantum_entropy, classical_entropy)

    return {
        "quantum_entropy":   quantum_entropy,
        "classical_entropy": classical_entropy,
        "quantum_bits":      quantum_bits,
        "classical_bits":    classical_bits,
        "comparison_plot":   plot_b64,
    }