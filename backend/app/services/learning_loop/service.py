from app.schemas.concept import CardView


def select_session_cards(cards: list[CardView], mode: str, target_id: str | None = None) -> list[CardView]:
    if mode == "SINGLE" and target_id:
        return [card for card in cards if card.id == target_id]
    if mode == "CHAPTER" and target_id:
        return [card for card in cards if card.chapter.endswith(target_id) or card.chapter == target_id]
    if mode == "WEAKNESS":
        return [card for card in cards if card.error_count > 0 or card.mastery < 0.6]
    return cards


def should_insert_quiz(current_index: int, every: int = 3) -> bool:
    return (current_index + 1) % every == 0
