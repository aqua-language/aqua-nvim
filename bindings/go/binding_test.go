package tree_sitter_aqua_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-aqua"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_aqua.Language())
	if language == nil {
		t.Errorf("Error loading Aqua grammar")
	}
}
