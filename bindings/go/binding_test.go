package tree_sitter_ats_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_ats "git.dwagon.org/mage/tree-sitter-ats/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_ats.Language())
	if language == nil {
		t.Errorf("Error loading ATS grammar")
	}
}
