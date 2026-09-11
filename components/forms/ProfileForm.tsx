"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X, Loader2, Sparkles, Code2, Heart, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileData {
  name: string;
  bio: string;
  skills: string[];
  interests: string[];
  projects: string[];
}

export function ProfileForm({ initialData }: { initialData?: Partial<ProfileData> }) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [interests, setInterests] = useState<string[]>(initialData?.interests || []);
  const [projects, setProjects] = useState<string[]>(initialData?.projects || []);

  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [projectInput, setProjectInput] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // Skill Handlers
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Interest Handlers
  const handleAddInterest = () => {
    const trimmed = interestInput.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setInterestInput("");
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter((i) => i !== interestToRemove));
  };

  // Project Handlers
  const handleAddProject = () => {
    const trimmed = projectInput.trim();
    if (trimmed && !projects.includes(trimmed)) {
      setProjects([...projects, trimmed]);
      setProjectInput("");
    }
  };

  const handleRemoveProject = (projectToRemove: string) => {
    setProjects(projects.filter((p) => p !== projectToRemove));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
          skills,
          interests,
          projects,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong saving your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card className="bg-card/60 border-border backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" /> Basic Details
          </CardTitle>
          <CardDescription>Personal information displayed across campus feature hubs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-semibold text-sm">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              required
              className="bg-background/50 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="font-semibold text-sm">Bio & Introduction</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share a short bio about your major, interests, or what you are currently learning..."
              rows={3}
              className="bg-background/50 border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills Tag Input */}
      <Card className="bg-card/60 border-border backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-indigo-400">
            <Code2 className="w-5 h-5" /> Technical & Practical Skills
          </CardTitle>
          <CardDescription>
            Used to calculate matching scores for project opportunities and team finder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="e.g. React, Python, Figma, PyTorch..."
              className="bg-background/50 border-border"
            />
            <Button type="button" onClick={handleAddSkill} variant="secondary">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No skills added yet. Add some skills above!</p>
            ) : (
              skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center gap-1.5"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interests Tag Input */}
      <Card className="bg-card/60 border-border backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-pink-400">
            <Heart className="w-5 h-5" /> Interests & Topics
          </CardTitle>
          <CardDescription>
            Used by Campus AI to recommend campus events and student clubs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddInterest();
                }
              }}
              placeholder="e.g. Artificial Intelligence, Robotics, Web Development..."
              className="bg-background/50 border-border"
            />
            <Button type="button" onClick={handleAddInterest} variant="secondary">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {interests.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No interests added yet.</p>
            ) : (
              interests.map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="px-3 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full flex items-center gap-1.5"
                >
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Projects Input */}
      <Card className="bg-card/60 border-border backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-purple-400">
            <FolderGit2 className="w-5 h-5" /> Highlighted Projects
          </CardTitle>
          <CardDescription>Showcase your past or current active projects.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={projectInput}
              onChange={(e) => setProjectInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddProject();
                }
              }}
              placeholder="e.g. AI Study Planner, Bus Tracker..."
              className="bg-background/50 border-border"
            />
            <Button type="button" onClick={handleAddProject} variant="secondary">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>

          <div className="space-y-2 pt-2">
            {projects.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No projects listed yet.</p>
            ) : (
              projects.map((project) => (
                <div
                  key={project}
                  className="flex items-center justify-between px-3 py-2 bg-accent/40 rounded-xl border border-border text-sm"
                >
                  <span className="font-medium text-foreground">{project}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(project)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2 rounded-xl font-semibold shadow-lg shadow-indigo-500/25"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Changes...
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </div>
    </form>
  );
}
