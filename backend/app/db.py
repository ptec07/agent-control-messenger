from dataclasses import dataclass


@dataclass(slots=True)
class DatabaseState:
    connected: bool = False


state = DatabaseState()
