"use client";

import React, { use } from "react";
import CreateMumble from "../CreateMumble";

interface PageProps {
  params: Promise<{ mumbleTo: string }>;
}

export default function SendMumbleUserPage({ params }: PageProps) {
  const resolvedParams = use(params);
  return <CreateMumble mumbleTo={resolvedParams.mumbleTo} />;
}
